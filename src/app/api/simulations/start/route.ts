import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Scenario } from "@/types/database";

const bodySchema = z.object({
  scenario_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const user = await requireUser();

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: scenario, error: scenarioError } = await admin
    .from("scenarios")
    .select("*")
    .eq("id", parsed.data.scenario_id)
    .single();

  if (scenarioError || !scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  const { data: sim, error: simError } = await admin
    .from("simulations")
    .insert({
      user_id: user.id,
      scenario_id: scenario.id,
      status: "in_progress",
      difficulty: scenario.difficulty,
    })
    .select("*")
    .single();

  if (simError || !sim) {
    return NextResponse.json({ error: "Could not start simulation" }, { status: 500 });
  }

  // Seed the opening AI message.
  await admin.from("messages").insert({
    simulation_id: sim.id,
    sender: "ai_client",
    message: (scenario as Scenario).opening_message,
  });

  const { data: messages } = await admin
    .from("messages")
    .select("*")
    .eq("simulation_id", sim.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ simulation: sim, scenario, messages: messages ?? [] });
}
