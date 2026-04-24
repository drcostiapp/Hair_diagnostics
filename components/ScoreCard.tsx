export function ScoreCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <div className="muted">{label}</div>
      <div className="kpi">{value}</div>
    </div>
  );
}
