import { requireManager } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppLayout } from "@/components/AppLayout";
import { ManagerTable } from "@/components/ManagerTable";
import { LuxuryButton } from "@/components/LuxuryButton";
import Link from "next/link";
import type { StaffRow } from "@/app/api/dashboard/staff/route";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const manager = await requireManager();
  const admin = supabaseAdmin();

  // Reuse the same aggregation the API uses so the view is consistent.
  const { data: users } = await admin
    .from("users")
    .select("id, name, email, role, branch, certification_status")
    .neq("role", "manager")
    .order("name", { ascending: true });

  const { data: sims } = await admin
    .from("simulations")
    .select("id, user_id, status, final_score, pass_fail, ended_at");
  const { data: evals } = await admin
    .from("evaluations")
    .select("simulation_id, luxury_violations");

  const evalBySim = new Map(
    (evals ?? []).map((e) => [e.simulation_id as string, (e.luxury_violations ?? []) as string[]]),
  );

  const rows: StaffRow[] = (users ?? []).map((u) => {
    const userSims = (sims ?? []).filter((s) => s.user_id === u.id && s.status === "completed");
    const completed = userSims.length;
    const failed = userSims.filter((s) => s.pass_fail === "FAIL").length;
    const avg =
      completed > 0
        ? Math.round(
            userSims.reduce((a, s) => a + (s.final_score ?? 0), 0) / completed,
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

  const totalCompleted = rows.reduce((a, r) => a + r.simulations_completed, 0);
  const totalFailed = rows.reduce((a, r) => a + r.simulations_failed, 0);
  const certifiedCount = rows.filter((r) => r.certification_status === "certified").length;
  const avgTeam =
    rows.filter((r) => r.average_score !== null).reduce((a, r) => a + (r.average_score ?? 0), 0) /
    Math.max(1, rows.filter((r) => r.average_score !== null).length);

  return (
    <AppLayout user={manager}>
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] tracking-luxe uppercase text-bronze">Manager</div>
          <h1 className="font-display text-4xl text-anchor mt-1">House Performance</h1>
          <p className="text-sm text-bronze mt-2 max-w-xl">
            Track certification, violations, and retraining across the team.
          </p>
        </div>
        <Link href="/api/manager/export" prefetch={false}>
          <LuxuryButton variant="outline">Export CSV</LuxuryButton>
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        <Stat label="Staff" value={rows.length} />
        <Stat label="Certified" value={certifiedCount} />
        <Stat label="Simulations Completed" value={totalCompleted} />
        <Stat
          label="Team Average"
          value={rows.length === 0 ? "—" : Math.round(avgTeam) || 0}
          suffix={rows.length === 0 ? undefined : "/100"}
        />
      </section>

      {totalFailed > 0 && (
        <div className="mt-6 rounded-luxe border border-[#E9C9C9] bg-[#FBECEC] p-4 text-sm text-[#7A2E2E]">
          {totalFailed} simulation{totalFailed === 1 ? "" : "s"} failed across the team — see
          individual profiles to review transcripts and assign retraining.
        </div>
      )}

      <section className="mt-8">
        <ManagerTable rows={rows} />
      </section>
    </AppLayout>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | string;
  suffix?: string;
}) {
  return (
    <div className="rounded-luxe border border-anchor/10 bg-white p-5 shadow-quiet">
      <div className="text-[11px] tracking-luxe uppercase text-bronze">{label}</div>
      <div className="flex items-baseline gap-1 mt-2">
        <div className="font-display text-3xl text-anchor">{value}</div>
        {suffix && <div className="text-xs text-bronze">{suffix}</div>}
      </div>
    </div>
  );
}
