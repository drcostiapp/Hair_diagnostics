import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SimulationRoom } from "./SimulationRoom";
import type { ChatMessage, Scenario } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function SimulationPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const admin = supabaseAdmin();

  const { data: sim } = await admin
    .from("simulations")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!sim || sim.user_id !== user.id) notFound();

  const { data: scenario } = await admin
    .from("scenarios")
    .select("*")
    .eq("id", sim.scenario_id)
    .single();

  if (!scenario) notFound();

  const { data: messages } = await admin
    .from("messages")
    .select("*")
    .eq("simulation_id", sim.id)
    .order("created_at", { ascending: true });

  return (
    <SimulationRoom
      user={user}
      simulationId={sim.id}
      status={sim.status}
      scenario={scenario as Scenario}
      initialMessages={(messages ?? []) as ChatMessage[]}
    />
  );
}
