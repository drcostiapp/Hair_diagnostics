import { AppLayout } from "@/components/AppLayout";
import { ScenarioCard } from "@/components/ScenarioCard";
import { supabaseAdmin } from "@/lib/supabase";

export default async function ScenarioLibraryPage() {
  const { data } = await supabaseAdmin.from("scenarios").select("*").order("difficulty", { ascending: true });

  return (
    <AppLayout>
      <h1>Scenario Library</h1>
      <p className="muted">Filter by category, difficulty, role, and pass/fail status.</p>
      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        {(data ?? []).map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </section>
    </AppLayout>
  );
}
