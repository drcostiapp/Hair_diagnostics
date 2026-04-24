import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppLayout } from "@/components/AppLayout";
import { ScenariosBrowser } from "./ScenariosBrowser";
import type { Scenario } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ScenariosPage() {
  const user = await requireUser();
  const admin = supabaseAdmin();

  const { data: scenarios } = await admin
    .from("scenarios")
    .select("*")
    .eq("is_active", true)
    .order("difficulty", { ascending: true });

  const { data: sims } = await admin
    .from("simulations")
    .select("scenario_id, pass_fail, status")
    .eq("user_id", user.id);

  const attempts = new Map<string, { pass: boolean; fail: boolean }>();
  for (const s of sims ?? []) {
    const prev = attempts.get(s.scenario_id) ?? { pass: false, fail: false };
    if (s.pass_fail === "PASS") prev.pass = true;
    if (s.pass_fail === "FAIL") prev.fail = true;
    attempts.set(s.scenario_id, prev);
  }

  const attemptsObj: Record<string, { pass: boolean; fail: boolean }> = {};
  attempts.forEach((v, k) => {
    attemptsObj[k] = v;
  });

  return (
    <AppLayout user={user}>
      <header>
        <div className="text-[11px] tracking-luxe uppercase text-bronze">Scenario Library</div>
        <h1 className="font-display text-4xl text-anchor mt-1">Choose a simulation.</h1>
        <p className="text-sm text-bronze mt-2 max-w-2xl">
          Every scenario is drawn from the She Doesn&apos;t Wait playbook. Filter by role,
          difficulty, or outcome.
        </p>
      </header>

      <div className="mt-8">
        <ScenariosBrowser
          scenarios={(scenarios ?? []) as Scenario[]}
          attempts={attemptsObj}
          defaultRole={user.role === "manager" ? null : user.role}
        />
      </div>
    </AppLayout>
  );
}
