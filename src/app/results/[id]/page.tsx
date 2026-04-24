import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppLayout } from "@/components/AppLayout";
import { EvaluationPanel } from "@/components/EvaluationPanel";
import { LuxuryButton } from "@/components/LuxuryButton";
import { difficultyLabel, formatDate, roleLabel } from "@/lib/format";
import { RetryButton } from "./RetryButton";
import type { Evaluation, Scenario } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const admin = supabaseAdmin();

  const { data: sim } = await admin
    .from("simulations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!sim) notFound();
  if (user.role !== "manager" && sim.user_id !== user.id) notFound();

  const [{ data: scenario }, { data: evaluation }] = await Promise.all([
    admin.from("scenarios").select("*").eq("id", sim.scenario_id).single(),
    admin.from("evaluations").select("*").eq("simulation_id", sim.id).maybeSingle(),
  ]);

  if (!scenario) notFound();

  const ev = evaluation as unknown as Evaluation | null;
  const sc = scenario as Scenario;

  const passed = sim.pass_fail === "PASS";

  return (
    <AppLayout user={user}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] tracking-luxe uppercase text-bronze">
            {sc.category} · {difficultyLabel(sc.difficulty)} · {roleLabel(sc.role_target)}
          </div>
          <h1 className="font-display text-4xl text-anchor mt-1">{sc.title}</h1>
          <p className="text-sm text-bronze mt-1">
            Completed {sim.ended_at ? formatDate(sim.ended_at) : "—"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/scenarios">
            <LuxuryButton variant="outline" size="md">
              Back to Library
            </LuxuryButton>
          </Link>
          <RetryButton scenarioId={sc.id} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`md:col-span-1 rounded-luxe p-6 ${
            passed
              ? "bg-champagne/15 border border-champagne"
              : "bg-[#FBECEC] border border-[#E9C9C9]"
          }`}
        >
          <div className="text-[11px] tracking-luxe uppercase text-bronze">Final Score</div>
          <div className="flex items-baseline gap-2 mt-1">
            <div className="font-display text-6xl text-anchor">{sim.final_score ?? 0}</div>
            <div className="text-bronze">/ 100</div>
          </div>
          <div
            className={`mt-3 inline-block text-[11px] tracking-luxe uppercase px-3 py-1 rounded-full ${
              passed ? "bg-champagne text-anchor" : "bg-[#7A2E2E] text-ivory"
            }`}
          >
            {passed ? "Pass" : "Fail"}
          </div>
        </div>

        <div className="md:col-span-2 rounded-luxe bg-white border border-anchor/10 p-6 shadow-quiet">
          <div className="text-[11px] tracking-luxe uppercase text-bronze">Evaluator Summary</div>
          <p className="mt-2 text-sm text-anchor leading-relaxed">
            {ev?.evaluator_summary?.split("\n")[0] ??
              "Evaluation will appear here once processed."}
          </p>
        </div>
      </div>

      <div className="mt-10">
        {ev ? (
          <EvaluationPanel evaluation={ev} coachFeedback={ev.evaluator_summary} />
        ) : (
          <div className="rounded-luxe border border-anchor/10 bg-ivory-warm p-8 text-center text-bronze text-sm">
            Evaluation not available. Please end the simulation from the chat screen.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
