import { AppLayout } from "@/components/AppLayout";
import { ScoreCard } from "@/components/ScoreCard";
import Link from "next/link";

export default function StaffDashboardPage() {
  return (
    <AppLayout>
      <h1>Welcome back</h1>
      <p className="muted">Today’s training target: Precision with restraint.</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        <ScoreCard label="Latest Score" value="92/100" />
        <ScoreCard label="Certification" value="In Progress" />
        <ScoreCard label="Weakest Category" value="Brevity & Control" />
        <ScoreCard label="Assigned Scenarios" value={5} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link className="btn btn-dark" href="/scenarios">Start Simulation</Link>
        <Link className="btn btn-ghost" href="/scenarios?status=failed">Retry Failed Scenario</Link>
      </div>
    </AppLayout>
  );
}
