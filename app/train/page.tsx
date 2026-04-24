import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATEGORY_LABELS, type Scenario, type ScenarioCategory, type UserProfile } from "@/lib/types";
import Header from "@/components/Header";
import DifficultyDots from "@/components/DifficultyDots";
import StartScenarioButton from "./StartScenarioButton";

export const dynamic = "force-dynamic";

export default async function TrainPage() {
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

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("difficulty");

  const grouped = (scenarios ?? []).reduce<Record<ScenarioCategory, Scenario[]>>(
    (acc, s) => {
      (acc[s.category] = acc[s.category] ?? []).push(s as Scenario);
      return acc;
    },
    {} as Record<ScenarioCategory, Scenario[]>,
  );

  return (
    <>
      <Header profile={profile as UserProfile} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">
            Welcome, {(profile as UserProfile).full_name.split(" ")[0]}
          </p>
          <h1 className="mt-2 font-display text-4xl text-anchor">
            Choose your rehearsal
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-anchor/70">
            Select a scenario to practise. The AI will play a real client —
            discerning, sometimes difficult. You reply as clinic staff. We
            score you privately at the end.
          </p>
        </div>

        <div className="space-y-10">
          {(Object.keys(grouped) as ScenarioCategory[]).map((cat) => (
            <section key={cat}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-display text-2xl text-anchor">
                  {CATEGORY_LABELS[cat]}
                </h2>
                <div className="gold-divider flex-1" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {grouped[cat].map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col justify-between rounded-2xl border border-anchor/10 bg-ivory-soft p-5 shadow-card transition hover:border-gold/50"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <DifficultyDots level={s.difficulty} />
                        <span className="text-[10px] uppercase tracking-widest text-anchor/40">
                          Level {s.difficulty}
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-anchor">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm text-anchor/70">
                        {s.description}
                      </p>
                    </div>
                    <div className="mt-5">
                      <StartScenarioButton scenarioId={s.id} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
