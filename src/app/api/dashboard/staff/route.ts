import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string | null;
  certification_status: string;
  simulations_completed: number;
  simulations_failed: number;
  average_score: number | null;
  luxury_violations: number;
  last_simulation_at: string | null;
}

export async function GET() {
  await requireManager();
  const admin = supabaseAdmin();

  const { data: users } = await admin
    .from("users")
    .select("id, name, email, role, branch, certification_status")
    .neq("role", "manager")
    .order("name", { ascending: true });

  if (!users) return NextResponse.json({ staff: [] });

  const { data: sims } = await admin
    .from("simulations")
    .select("id, user_id, status, final_score, pass_fail, ended_at");
  const { data: evals } = await admin
    .from("evaluations")
    .select("simulation_id, luxury_violations");

  const evalBySim = new Map(
    (evals ?? []).map((e) => [e.simulation_id as string, (e.luxury_violations ?? []) as string[]]),
  );

  const rows: StaffRow[] = users.map((u) => {
    const userSims = (sims ?? []).filter((s) => s.user_id === u.id && s.status === "completed");
    const completed = userSims.length;
    const failed = userSims.filter((s) => s.pass_fail === "FAIL").length;
    const avg =
      completed > 0
        ? Math.round(
            userSims.reduce((acc, s) => acc + (s.final_score ?? 0), 0) / completed,
          )
        : null;
    const luxuryViolations = userSims.reduce((acc, s) => {
      const arr = evalBySim.get(s.id as string) ?? [];
      return acc + arr.length;
    }, 0);
    const last = userSims
      .map((s) => s.ended_at)
      .filter((x): x is string => !!x)
      .sort()
      .pop();

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      branch: u.branch,
      certification_status: u.certification_status,
      simulations_completed: completed,
      simulations_failed: failed,
      average_score: avg,
      luxury_violations: luxuryViolations,
      last_simulation_at: last ?? null,
    };
  });

  return NextResponse.json({ staff: rows });
}
