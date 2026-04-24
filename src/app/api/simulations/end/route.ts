import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { runEvaluator } from "@/lib/ai/evaluator";
import { runCoach } from "@/lib/ai/coach";
import { recomputeCertification } from "@/lib/certification";
import type { ChatMessage, Scenario, UserRole } from "@/types/database";

const bodySchema = z.object({
  simulation_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const user = await requireUser();

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: sim } = await admin
    .from("simulations")
    .select("*, scenarios(*)")
    .eq("id", parsed.data.simulation_id)
    .single();

  if (!sim || sim.user_id !== user.id) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }

  const { data: messages } = await admin
    .from("messages")
    .select("sender, message")
    .eq("simulation_id", sim.id)
    .order("created_at", { ascending: true });

  const traineeHasSpoken = (messages ?? []).some((m) => m.sender === "trainee");
  if (!traineeHasSpoken) {
    return NextResponse.json(
      { error: "Send at least one reply before ending the simulation." },
      { status: 400 },
    );
  }

  const scenario = sim.scenarios as unknown as Scenario;

  let evaluation;
  try {
    evaluation = await runEvaluator({
      scenario,
      transcript: (messages ?? []) as Pick<ChatMessage, "sender" | "message">[],
    });
  } catch (err) {
    console.error("[evaluator] failed", err);
    return NextResponse.json(
      { error: "Evaluator is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }

  let coachFeedback = "";
  try {
    coachFeedback = await runCoach({ scenario, evaluation });
  } catch (err) {
    console.error("[coach] failed", err);
    coachFeedback = evaluation.evaluator_summary;
  }

  await admin.from("evaluations").upsert(
    {
      simulation_id: sim.id,
      tone_score: evaluation.tone_score,
      sop_score: evaluation.sop_score,
      brevity_score: evaluation.brevity_score,
      emotional_score: evaluation.emotional_score,
      discipline_score: evaluation.discipline_score,
      final_score: evaluation.final_score,
      pass_fail: evaluation.pass_fail,
      luxury_violations: evaluation.luxury_violations,
      key_mistakes: evaluation.key_mistakes,
      best_response: evaluation.best_response,
      weakest_response: evaluation.weakest_response,
      corrected_responses: evaluation.corrected_responses,
      recommendation: evaluation.recommendation,
      evaluator_summary: coachFeedback || evaluation.evaluator_summary,
    },
    { onConflict: "simulation_id" },
  );

  await admin
    .from("simulations")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      final_score: evaluation.final_score,
      pass_fail: evaluation.pass_fail,
    })
    .eq("id", sim.id);

  await recomputeCertification(user.id, user.role as UserRole);

  return NextResponse.json({
    evaluation,
    coach_feedback: coachFeedback,
  });
}
