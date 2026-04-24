import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import {
  buildEvaluatorSystemPrompt,
  buildEvaluatorUserPrompt,
} from "@/lib/prompts";
import { parseEvaluatorJSON } from "@/lib/scoring";
import type { Message, Scenario } from "@/lib/types";

const BodySchema = z.object({ simulation_id: z.string().uuid() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  const { simulation_id } = parsed.data;

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sim } = await supabase
    .from("simulations")
    .select("*")
    .eq("id", simulation_id)
    .single();
  if (!sim || sim.user_id !== user.id)
    return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (sim.status === "completed") {
    return NextResponse.json({ ok: true, already_scored: true });
  }

  const [{ data: scenario }, { data: messages }] = await Promise.all([
    supabase.from("scenarios").select("*").eq("id", sim.scenario_id).single(),
    supabase
      .from("messages")
      .select("*")
      .eq("simulation_id", simulation_id)
      .order("created_at"),
  ]);

  if (!scenario)
    return NextResponse.json({ error: "Scenario missing." }, { status: 404 });

  const history = (messages ?? []) as Message[];
  const traineeTurns = history.filter((m) => m.sender === "trainee");
  if (traineeTurns.length === 0) {
    return NextResponse.json(
      { error: "No trainee replies to evaluate." },
      { status: 400 },
    );
  }

  const opening =
    history.find((m) => m.sender === "ai")?.content ?? scenario.opening_message;
  const turns = history
    .filter(
      (m, i) =>
        m.sender !== "system" && !(i === 0 && m.sender === "ai"),
    )
    .map((m) => ({
      sender: m.sender as "ai" | "trainee",
      content: m.content,
    }));

  let parsedOut;
  try {
    const anthropic = getAnthropic();
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: buildEvaluatorSystemPrompt(scenario as Scenario),
      messages: [
        { role: "user", content: buildEvaluatorUserPrompt({ opening, turns }) },
      ],
    });
    const raw = res.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");
    parsedOut = parseEvaluatorJSON(raw);
  } catch (e: any) {
    return NextResponse.json(
      { error: `Evaluation error: ${e?.message ?? "unknown"}` },
      { status: 502 },
    );
  }

  const { error: insertErr } = await supabase.from("evaluations").insert({
    simulation_id,
    user_id: user.id,
    score_tone: parsedOut.scores.tone_and_elegance,
    score_sop: parsedOut.scores.sop_accuracy,
    score_brevity: parsedOut.scores.brevity_and_control,
    score_eq: parsedOut.scores.emotional_intelligence,
    score_luxury: parsedOut.scores.luxury_discipline,
    auto_fail: parsedOut.auto_fail,
    fail_reasons: parsedOut.fail_reasons,
    mistakes: parsedOut.mistakes,
    luxury_violations: parsedOut.luxury_violations,
    corrected_responses: parsedOut.corrected_responses,
    recommended_module: parsedOut.recommended_module,
  });
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  await supabase
    .from("simulations")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", simulation_id);

  return NextResponse.json({ ok: true });
}
