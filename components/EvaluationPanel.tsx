export function EvaluationPanel({
  scenarioTitle,
  difficulty,
  role,
  warnings
}: {
  scenarioTitle: string;
  difficulty: number;
  role: string;
  warnings: string[];
}) {
  return (
    <aside className="card" style={{ height: "fit-content" }}>
      <h3>{scenarioTitle}</h3>
      <p className="muted">Difficulty: {difficulty} · Role: {role}</p>
      <h4>SOP Reminders</h4>
      <ul>
        <li>$420 consultation, $100 reservation fee, $320 day-of.</li>
        <li>Select Saturdays, one client at a time, 60-minute private visit.</li>
        <li>48h preference questionnaire; morning-of location coordination.</li>
      </ul>
      <h4>Live Tone Warnings</h4>
      <ul>{warnings.map((w, idx) => <li key={idx}>{w}</li>)}</ul>
      <p className="muted">Hidden evaluator running silently.</p>
    </aside>
  );
}
