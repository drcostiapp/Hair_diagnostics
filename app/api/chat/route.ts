import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import { buildClientSystemPrompt } from "@/lib/prompts";
import type { Scenario, UserProfile, Message } from "@/lib/types";

const BodySchema = z.object({
  simulation_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const { simulation_id, content } = parsed.data;

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
  if (!sim || sim.user_id !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (sim.status !== "in_progress") {
    return NextResponse.json({ error: "Simulation already completed." }, { status: 409 });
  }

  const [{ data: profile }, { data: scenario }, { data: history }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("scenarios").select("*").eq("id", sim.scenario_id).single(),
      supabase
        .from("messages")
        .select("*")
        .eq("simulation_id", simulation_id)
        .order("created_at"),
    ]);

  if (!profile || !scenario) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Persist trainee message
  const { data: traineeMsg, error: teErr } = await supabase
    .from("messages")
    .insert({
      simulation_id,
      sender: "trainee",
      content,
    })
    .select("*")
    .single();
  if (teErr || !traineeMsg) {
    return NextResponse.json({ error: teErr?.message ?? "Insert failed." }, { status: 500 });
  }

  // Build Anthropic message history. AI plays CLIENT → its messages are "assistant";
  // trainee replies are "user".
  const allMessages: Message[] = [
    ...((history ?? []) as Message[]),
    traineeMsg as Message,
  ];

  const anthropicMessages = allMessages
    .filter((m) => m.sender !== "system")
    .map((m) => ({
      role: m.sender === "ai" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

  // Safety: conversation must start with a "user" turn for the API.
  // Our AI sends first, so we prepend a neutral user seed.
  if (anthropicMessages[0]?.role === "assistant") {
    anthropicMessages.unshift({
      role: "user",
      content: "[training session begins]",
    });
  }

  let aiText = "";
  try {
    const anthropic = getAnthropic();
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: buildClientSystemPrompt(scenario as Scenario, profile as UserProfile),
      messages: anthropicMessages,
    });
    aiText = res.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();
  } catch (e: any) {
    return NextResponse.json(
      { error: `AI error: ${e?.message ?? "unknown"}` },
      { status: 502 },
    );
  }

  if (!aiText) {
    aiText = "…";
  }

  const { data: aiMsg, error: aiErr } = await supabase
    .from("messages")
    .insert({
      simulation_id,
      sender: "ai",
      content: aiText,
    })
    .select("*")
    .single();
  if (aiErr || !aiMsg) {
    return NextResponse.json({ error: aiErr?.message ?? "Insert failed." }, { status: 500 });
  }

  await supabase
    .from("simulations")
    .update({ turn_count: (sim.turn_count ?? 0) + 1 })
    .eq("id", simulation_id);

  return NextResponse.json({ trainee_message: traineeMsg, ai_message: aiMsg });
}
