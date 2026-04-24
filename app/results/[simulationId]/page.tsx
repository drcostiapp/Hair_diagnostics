import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  CATEGORY_LABELS,
  type CorrectedResponse,
  type Evaluation,
  type Message,
  type Scenario,
  type UserProfile,
} from "@/lib/types";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: { simulationId: string };
}) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  const { data: sim } = await supabase
    .from("simulations")
    .select("*")
    .eq("id", params.simulationId)
    .single();
  if (!sim) notFound();

  const [{ data: scenario }, { data: evaluation }, { data: messages }] =
    await Promise.all([
      supabase.from("scenarios").select("*").eq("id", sim.scenario_id).single(),
      supabase
        .from("evaluations")
        .select("*")
        .eq("simulation_id", sim.id)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("*")
        .eq("simulation_id", sim.id)
        .order("created_at"),
    ]);

  if (!scenario) notFound();

  const evalData = evaluation as Evaluation | null;

  return (
    <>
      <Header profile={profile as UserProfile} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">
          {CATEGORY_LABELS[(scenario as Scenario).category]}
        </p>
        <h1 className="mt-2 font-display text-4xl text-anchor">
          {(scenario as Scenario).title}
        </h1>
        <div className="gold-divider my-6 w-48" />

        {!evalData ? (
          <p className="text-sm text-anchor/70">
            Scoring in progress. Please refresh in a moment.
          </p>
        ) : (
          <>
            <ScoreHero evaluation={evalData} />
            <Breakdown evaluation={evalData} />
            {evalData.auto_fail && (
              <Section title="Why this was an automatic fail">
                <ul className="list-disc space-y-2 pl-6 text-sm text-red-800">
                  {evalData.fail_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </Section>
            )}
            {evalData.mistakes.length > 0 && (
              <Section title="Mistakes to correct">
                <ul className="list-disc space-y-2 pl-6 text-sm text-anchor/80">
                  {evalData.mistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </Section>
            )}
            {evalData.luxury_violations.length > 0 && (
              <Section title="Luxury violations">
                <ul className="list-disc space-y-2 pl-6 text-sm text-anchor/80">
                  {evalData.luxury_violations.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </Section>
            )}
            {evalData.corrected_responses.length > 0 && (
              <Section title="Gold-standard rewrites">
                <div className="space-y-4">
                  {evalData.corrected_responses.map(
                    (c: CorrectedResponse, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-anchor/10 bg-ivory-soft p-4 shadow-card"
                      >
                        <p className="text-[10px] uppercase tracking-widest text-anchor/40">
                          You said
                        </p>
                        <p className="mt-1 text-sm italic text-anchor/70">
                          “{c.trainee_said}”
                        </p>
                        <p className="mt-3 text-[10px] uppercase tracking-widest text-gold">
                          Dr. Costi standard
                        </p>
                        <p className="mt-1 text-sm text-anchor">
                          {c.gold_standard}
                        </p>
                        {c.why && (
                          <p className="mt-2 text-xs text-anchor/60">
                            Why: {c.why}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </Section>
            )}
            {evalData.recommended_module && (
              <Section title="Recommended module to repeat">
                <p className="text-sm text-anchor/80">
                  {evalData.recommended_module}
                </p>
              </Section>
            )}

            <Section title="Transcript">
              <div className="space-y-2 rounded-2xl border border-anchor/10 bg-ivory-soft p-4 text-sm shadow-card">
                {(messages as Message[] | null)?.map((m) => (
                  <div key={m.id}>
                    <span
                      className={`mr-2 text-[10px] uppercase tracking-widest ${
                        m.sender === "trainee"
                          ? "text-anchor"
                          : "text-gold-dark"
                      }`}
                    >
                      {m.sender === "trainee" ? "You" : "Client"}:
                    </span>
                    <span className="whitespace-pre-wrap text-anchor/80">
                      {m.content}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <div className="mt-10 flex gap-3">
              <Link
                href="/train"
                className="rounded-full bg-anchor px-6 py-3 text-xs uppercase tracking-widest text-ivory hover:bg-anchor-soft"
              >
                Return to training
              </Link>
              {(profile as UserProfile).is_manager && (
                <Link
                  href="/dashboard"
                  className="rounded-full border border-anchor/20 px-6 py-3 text-xs uppercase tracking-widest text-anchor hover:border-gold hover:text-gold-dark"
                >
                  Manager dashboard
                </Link>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function ScoreHero({ evaluation }: { evaluation: Evaluation }) {
  const passed = evaluation.passed;
  return (
    <div className="mb-8 flex flex-col items-center rounded-2xl border border-anchor/10 bg-ivory-soft px-8 py-10 shadow-luxe">
      <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
        Final score
      </p>
      <p className="mt-2 font-display text-7xl text-anchor">
        {evaluation.total_score}
        <span className="text-2xl text-anchor/40"> / 100</span>
      </p>
      <p
        className={`mt-3 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest ${
          passed
            ? "bg-anchor text-ivory"
            : "bg-red-800/10 text-red-800"
        }`}
      >
        {passed ? "Pass" : evaluation.auto_fail ? "Automatic fail" : "Fail"}
      </p>
    </div>
  );
}

function Breakdown({ evaluation }: { evaluation: Evaluation }) {
  const rows = [
    { label: "Tone & Elegance", value: evaluation.score_tone, max: 25 },
    { label: "SOP Accuracy", value: evaluation.score_sop, max: 25 },
    { label: "Brevity & Control", value: evaluation.score_brevity, max: 20 },
    { label: "Emotional Intelligence", value: evaluation.score_eq, max: 20 },
    { label: "Luxury Discipline", value: evaluation.score_luxury, max: 10 },
  ];
  return (
    <Section title="Score breakdown">
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-sm text-anchor">
              <span>{r.label}</span>
              <span className="text-anchor/60">
                {r.value} / {r.max}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-anchor/10">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${(r.value / r.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl text-anchor">{title}</h2>
      <div className="gold-divider my-3 w-32" />
      {children}
    </section>
  );
}
