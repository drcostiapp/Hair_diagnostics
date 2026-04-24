import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppLayout } from "@/components/AppLayout";
import { ScenarioCard } from "@/components/ScenarioCard";
import { CertificationBadge } from "@/components/CertificationBadge";
import { LuxuryButton } from "@/components/LuxuryButton";
import { ProgressChart } from "@/components/ProgressChart";
import { roleLabel, difficultyLabel, formatDate } from "@/lib/format";
import { CERT_RULES } from "@/lib/certification";
import type { Scenario } from "@/types/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "manager") {
    const { redirect } = await import("next/navigation");
    redirect("/manager");
  }
  const admin = supabaseAdmin();

  // Scenarios for this role
  const { data: scenarios } = await admin
    .from("scenarios")
    .select("*")
    .eq("is_active", true)
    .eq("role_target", user.role)
    .order("difficulty", { ascending: true });

  // Recent simulations
  const { data: recentSims } = await admin
    .from("simulations")
    .select("id, scenario_id, final_score, pass_fail, ended_at, status")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(10);

  const completed = (recentSims ?? []).filter((s) => s.status === "completed");
  const lastScore = completed[0]?.final_score ?? null;
  const scoreTrend = completed
    .slice()
    .reverse()
    .map((s) => s.final_score ?? 0);

  // Weakest category: find most recent FAIL scenario
  const lastFail = completed.find((s) => s.pass_fail === "FAIL");
  let weakestScenario: Scenario | null = null;
  if (lastFail) {
    const { data: sc } = await admin
      .from("scenarios")
      .select("*")
      .eq("id", lastFail.scenario_id)
      .single();
    weakestScenario = (sc as Scenario) ?? null;
  }

  // Daily training scenario: rotate deterministically by date
  const dayIndex =
    scenarios && scenarios.length > 0
      ? Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % scenarios.length
      : -1;
  const dailyScenario: Scenario | null =
    dayIndex >= 0 ? ((scenarios?.[dayIndex] ?? null) as Scenario | null) : null;

  const { data: cert } = await admin
    .from("certifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("role", user.role)
    .maybeSingle();

  return (
    <AppLayout user={user}>
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] tracking-luxe uppercase text-bronze">
            {roleLabel(user.role)} Training
          </div>
          <h1 className="font-display text-4xl text-anchor mt-1">
            Good to see you, {user.name.split(" ")[0]}.
          </h1>
          <p className="text-sm text-bronze mt-2 max-w-xl">
            Complete at least {CERT_RULES.REQUIRED_SCENARIOS_PER_ROLE} scenarios at{" "}
            {CERT_RULES.MIN_AVERAGE_SCORE}+ to reach manager certification.
          </p>
        </div>
        <CertificationBadge status={user.certification_status} />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="rounded-luxe border border-anchor/10 bg-white p-5 shadow-quiet">
          <div className="text-[11px] tracking-luxe uppercase text-bronze">Latest Score</div>
          <div className="flex items-baseline gap-1 mt-2">
            <div className="font-display text-4xl text-anchor">{lastScore ?? "—"}</div>
            {lastScore !== null && <div className="text-sm text-bronze">/ 100</div>}
          </div>
          <div className="text-xs text-bronze mt-1">
            {completed.length > 0 ? formatDate(completed[0].ended_at!) : "No simulations yet"}
          </div>
        </div>

        <div className="rounded-luxe border border-anchor/10 bg-white p-5 shadow-quiet">
          <div className="text-[11px] tracking-luxe uppercase text-bronze">
            Simulations Completed
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <div className="font-display text-4xl text-anchor">
              {cert?.required_scenarios_completed ?? completed.length}
            </div>
            <div className="text-sm text-bronze">
              / {CERT_RULES.REQUIRED_SCENARIOS_PER_ROLE}
            </div>
          </div>
          <div className="text-xs text-bronze mt-1">
            Average: {cert?.average_score ?? 0}
          </div>
        </div>

        <div className="rounded-luxe border border-champagne/50 bg-champagne/10 p-5">
          <div className="text-[11px] tracking-luxe uppercase text-anchor">Weakest Pattern</div>
          <div className="font-display text-lg text-anchor mt-2 leading-snug">
            {weakestScenario ? weakestScenario.title : "No failures recorded"}
          </div>
          <div className="text-xs text-bronze mt-1">
            {weakestScenario
              ? `${weakestScenario.category} · ${difficultyLabel(weakestScenario.difficulty)}`
              : "Keep it up."}
          </div>
          {weakestScenario && (
            <Link href={`/scenarios?focus=${weakestScenario.id}`} className="inline-block mt-3">
              <LuxuryButton size="sm" variant="outline">
                Retry Failed Scenario
              </LuxuryButton>
            </Link>
          )}
        </div>
      </section>

      {dailyScenario && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-anchor">Today&apos;s Training</h2>
            <span className="text-[11px] tracking-luxe uppercase text-champagne">
              {difficultyLabel(dailyScenario.difficulty)}
            </span>
          </div>
          <div className="mt-4">
            <ScenarioCard scenario={dailyScenario} />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl text-anchor">Assigned Scenarios</h2>
        <p className="text-sm text-bronze mt-1">
          Practise the situations you will face as {roleLabel(user.role)}.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {(scenarios ?? []).map((s) => (
            <ScenarioCard key={s.id} scenario={s as Scenario} />
          ))}
          {(!scenarios || scenarios.length === 0) && (
            <div className="col-span-full rounded-luxe border border-anchor/10 bg-ivory-warm p-8 text-center text-bronze text-sm">
              No scenarios assigned for your role yet. Speak to your manager.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-anchor">Trajectory</h2>
        <div className="mt-4">
          <ProgressChart scores={scoreTrend} />
        </div>
      </section>
    </AppLayout>
  );
}
