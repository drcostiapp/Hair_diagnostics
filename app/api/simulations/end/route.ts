import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { buildCoachFeedback, evaluateSimulation } from "@/lib/ai";

const schema = z.object({ simulation_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const { simulation_id } = schema.parse(await req.json());

  const { data: simulation } = await supabaseAdmin
    .from("simulations")
    .select("id,user_id,scenario_id, scenarios(*)")
    .eq("id", simulation_id)
    .single();

  const { data: transcript } = await supabaseAdmin
    .from("messages")
    .select("sender,message")
    .eq("simulation_id", simulation_id)
    .order("timestamp", { ascending: true });

  const evaluation = await evaluateSimulation({
    scenario: simulation?.scenarios,
    transcript: transcript ?? []
  });

  const coach_feedback = await buildCoachFeedback(evaluation);

  await supabaseAdmin.from("evaluations").insert({ simulation_id, ...evaluation, recommendation: coach_feedback });

  await supabaseAdmin
    .from("simulations")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      final_score: evaluation.final_score,
      pass_fail: evaluation.pass_fail
    })
    .eq("id", simulation_id);

  return NextResponse.json({ evaluation, coach_feedback });
}
