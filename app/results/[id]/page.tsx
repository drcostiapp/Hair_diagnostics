import { AppLayout } from "@/components/AppLayout";
import { ViolationTag } from "@/components/ViolationTag";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const { data: evaluation } = await supabaseAdmin
    .from("evaluations")
    .select("*")
    .eq("simulation_id", params.id)
    .maybeSingle();

  if (!evaluation) return <AppLayout><p>No evaluation found.</p></AppLayout>;

  return (
    <AppLayout>
      <h1>Simulation Results</h1>
      <h2>{evaluation.final_score}/100 · {evaluation.pass_fail}</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(5,minmax(100px,1fr))" }}>
        <div className="card">Tone {evaluation.tone_score}</div>
        <div className="card">SOP {evaluation.sop_score}</div>
        <div className="card">Brevity {evaluation.brevity_score}</div>
        <div className="card">EQ {evaluation.emotional_score}</div>
        <div className="card">Discipline {evaluation.discipline_score}</div>
      </div>
      <h3>Luxury Violations</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{evaluation.luxury_violations.map((v: string) => <ViolationTag key={v} text={v} />)}</div>
      <h3>Corrected Gold-Standard Responses</h3>
      <pre className="card" style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(evaluation.corrected_responses, null, 2)}</pre>
      <p><strong>Recommendation:</strong> {evaluation.recommendation}</p>
      <Link className="btn btn-dark" href="/scenarios">Retry same scenario</Link>
    </AppLayout>
  );
}
