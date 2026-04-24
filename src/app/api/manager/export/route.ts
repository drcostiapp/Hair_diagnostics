import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET() {
  await requireManager();
  const admin = supabaseAdmin();

  const { data: users } = await admin
    .from("users")
    .select("id, name, email, role, branch, certification_status")
    .neq("role", "manager");
  const { data: sims } = await admin
    .from("simulations")
    .select("user_id, final_score, pass_fail, status");
  const { data: evals } = await admin
    .from("evaluations")
    .select("simulation_id, luxury_violations");

  const header = [
    "name",
    "email",
    "role",
    "branch",
    "certification_status",
    "simulations_completed",
    "simulations_failed",
    "average_score",
    "luxury_violations",
  ];

  const evalBySim = new Map(
    (evals ?? []).map((e) => [e.simulation_id as string, (e.luxury_violations ?? []) as string[]]),
  );

  const lines = [header.map(csvEscape).join(",")];

  for (const u of users ?? []) {
    const userSims = (sims ?? []).filter((s) => s.user_id === u.id && s.status === "completed");
    const completed = userSims.length;
    const failed = userSims.filter((s) => s.pass_fail === "FAIL").length;
    const avg =
      completed > 0
        ? Math.round(userSims.reduce((a, s) => a + (s.final_score ?? 0), 0) / completed)
        : "";
    const luxuryViolations = userSims.reduce(
      (acc, _s) => acc + (evalBySim.get(_s as unknown as string) ?? []).length,
      0,
    );
    lines.push(
      [
        u.name,
        u.email,
        u.role,
        u.branch,
        u.certification_status,
        completed,
        failed,
        avg,
        luxuryViolations,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dr-costi-staff-report-${Date.now()}.csv"`,
    },
  });
}
