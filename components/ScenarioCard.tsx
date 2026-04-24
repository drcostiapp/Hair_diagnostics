import { Scenario } from "@/lib/types";
import Link from "next/link";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <article className="card">
      <h3>{scenario.title}</h3>
      <p className="muted">{scenario.category} · Level {scenario.difficulty}</p>
      <p>{scenario.scenario_context}</p>
      <Link className="btn btn-dark" href={`/simulation/${scenario.id}`}>
        Start Simulation
      </Link>
    </article>
  );
}
