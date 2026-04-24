import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Message, Scenario, UserProfile } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import Header from "@/components/Header";
import DifficultyDots from "@/components/DifficultyDots";
import ChatWindow from "./ChatWindow";

export const dynamic = "force-dynamic";

export default async function SimulationPage({
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

  if (sim.status === "completed") {
    redirect(`/results/${sim.id}`);
  }

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", sim.scenario_id)
    .single();
  if (!scenario) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("simulation_id", sim.id)
    .order("created_at");

  return (
    <>
      <Header profile={profile as UserProfile} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 rounded-2xl border border-anchor/10 bg-ivory-soft px-5 py-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold">
                {CATEGORY_LABELS[scenario.category as Scenario["category"]]}
              </p>
              <h1 className="font-display text-2xl text-anchor">
                {scenario.title}
              </h1>
            </div>
            <DifficultyDots level={scenario.difficulty} />
          </div>
          <p className="mt-2 text-sm text-anchor/70">{scenario.description}</p>
        </div>
        <ChatWindow
          simulationId={sim.id}
          scenario={scenario as Scenario}
          initialMessages={(messages ?? []) as Message[]}
        />
      </main>
    </>
  );
}
