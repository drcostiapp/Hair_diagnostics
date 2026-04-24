import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import { buildClientSystemPrompt } from "@/lib/prompts";
import type { Scenario, UserProfile } from "@/lib/types";

const BodySchema = z.object({ scenario_id: z.string().uuid() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: scenario }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("scenarios")
      .select("*")
      .eq("id", parsed.data.scenario_id)
      .single(),
  ]);

  if (!profile || !scenario) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: sim, error } = await supabase
    .from("simulations")
    .insert({
      user_id: user.id,
      scenario_id: scenario.id,
    })
    .select("*")
    .single();

  if (error || !sim) {
    return NextResponse.json({ error: error?.message ?? "Insert failed." }, { status: 500 });
  }

  // Seed the conversation with the client's opening message.
  // For difficulty >= 3 we ask the AI to generate the opener itself to add variance.
  let opening = scenario.opening_message as string;
  if (scenario.difficulty >= 3) {
    try {
      const anthropic = getAnthropic();
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 200,
        system: buildClientSystemPrompt(scenario as Scenario, profile as UserProfile),
        messages: [
          {
            role: "user",
            content:
              `Write the FIRST WhatsApp message the client sends, based on this seed: "${scenario.opening_message}". Keep it short (1–3 lines), in character, and realistic.`,
          },
        ],
      });
      const text = res.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("")
        .trim();
      if (text) opening = text;
    } catch {
      /* fall back to seeded opener */
    }
  }

  await supabase.from("messages").insert({
    simulation_id: sim.id,
    sender: "ai",
    content: opening,
  });

  return NextResponse.json({ simulation_id: sim.id });
}
