import { supabaseAdmin } from "@/lib/supabase/admin";
import type { UserRole, CertificationStatus } from "@/types/database";

const REQUIRED_SCENARIOS_PER_ROLE = 5;
const MIN_AVERAGE_SCORE = 90;

/**
 * Recalculate and upsert the certification row for a user.
 * Rules:
 * - Must complete REQUIRED_SCENARIOS_PER_ROLE simulations
 * - Minimum average score of 90
 * - No luxury-violation automatic-fail in final 3 simulations
 * - Manager approval still required to flip to "certified"
 *   (this function will move to "in_progress" / "needs_retraining"
 *    but never auto-certify without a manager).
 */
export async function recomputeCertification(userId: string, role: UserRole) {
  const admin = supabaseAdmin();

  const { data: sims } = await admin
    .from("simulations")
    .select("id, final_score, pass_fail, ended_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("ended_at", { ascending: false });

  const completed = sims ?? [];
  const scored = completed.filter((s) => typeof s.final_score === "number");
  const avg =
    scored.length > 0
      ? Math.round(scored.reduce((acc, s) => acc + (s.final_score as number), 0) / scored.length)
      : 0;

  let violationsInLast3 = 0;
  if (completed.length >= 3) {
    const lastThreeIds = completed.slice(0, 3).map((s) => s.id);
    const { data: evals } = await admin
      .from("evaluations")
      .select("simulation_id, luxury_violations")
      .in("simulation_id", lastThreeIds);
    violationsInLast3 =
      evals?.reduce((acc, e) => acc + (e.luxury_violations?.length ?? 0), 0) ?? 0;
  }

  let status: CertificationStatus = "not_started";
  if (completed.length === 0) status = "not_started";
  else if (
    completed.length >= REQUIRED_SCENARIOS_PER_ROLE &&
    avg >= MIN_AVERAGE_SCORE &&
    violationsInLast3 === 0
  ) {
    // Eligible — leave for manager to flip to 'certified'
    status = "in_progress";
  } else if (scored.length >= 3 && avg < MIN_AVERAGE_SCORE) {
    status = "needs_retraining";
  } else {
    status = "in_progress";
  }

  await admin.from("certifications").upsert(
    {
      user_id: userId,
      role,
      required_scenarios_completed: completed.length,
      average_score: avg,
      certification_status: status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,role" },
  );

  await admin.from("users").update({ certification_status: status }).eq("id", userId);

  return { completed: completed.length, avg, status, violationsInLast3 };
}

export const CERT_RULES = {
  REQUIRED_SCENARIOS_PER_ROLE,
  MIN_AVERAGE_SCORE,
};
