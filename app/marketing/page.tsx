"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ScoreCard } from "@/components/ScoreCard";
import { ProgressChart } from "@/components/ProgressChart";
import { MarketingReport } from "@/lib/types";

type HistoryRow = { created_at: string; overall_marketing_score: number | null };

export default function MarketingEnginePage() {
  const [business, setBusiness] = useState("Dr. Costi House of Beauty");
  const [campaignData, setCampaignData] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<MarketingReport | null>(null);
  const [history, setHistory] = useState<{ date: string; score: number }[]>([]);

  async function loadHistory() {
    const res = await fetch("/api/marketing");
    if (!res.ok) return;
    const { reports } = (await res.json()) as { reports: HistoryRow[] };
    setHistory(
      reports
        .filter((r) => r.overall_marketing_score !== null)
        .map((r) => ({ date: new Date(r.created_at).toLocaleDateString(), score: r.overall_marketing_score as number }))
    );
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function runAudit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business,
          campaign_data: campaignData,
          competitors: competitors || undefined
        })
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { report } = (await res.json()) as { report: MarketingReport };
      setReport(report);
      loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <h1>Marketing Engine</h1>
      <p className="muted">
        Elite Marketing Intelligence &amp; Campaign Optimization Engine. Paste current campaign metrics and competitor
        context to produce a full audit and Executive Summary.
      </p>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <label className="muted">
          Business
          <input
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            style={{ width: "100%", padding: ".6rem", borderRadius: 12, border: "1px solid rgba(14,42,55,.2)", font: "inherit", marginTop: 4 }}
          />
        </label>
        <label className="muted">
          Campaign data (metrics, ad sets, creatives, funnel stages)
          <textarea
            value={campaignData}
            onChange={(e) => setCampaignData(e.target.value)}
            placeholder="e.g. Meta Reels campaign, reach 48k, CTR 0.9%, CPL $22, ROAS 1.8, 3 ad sets, top creative = transformation reel..."
            style={{ width: "100%", minHeight: 120, resize: "vertical", borderRadius: 12, border: "1px solid rgba(14,42,55,.2)", padding: ".75rem", font: "inherit", marginTop: 4 }}
          />
        </label>
        <label className="muted">
          Competitor context (optional)
          <textarea
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="e.g. Competitor A posts 5x/week, heavy discounting; Competitor B strong before/after carousels..."
            style={{ width: "100%", minHeight: 80, resize: "vertical", borderRadius: 12, border: "1px solid rgba(14,42,55,.2)", padding: ".75rem", font: "inherit", marginTop: 4 }}
          />
        </label>
        <div>
          <button className="btn btn-dark" onClick={runAudit} disabled={loading || !campaignData.trim()}>
            {loading ? "Auditing…" : "Run Marketing Audit"}
          </button>
        </div>
        {error && <p style={{ color: "#9b2c2c" }}>{error}</p>}
      </div>

      {history.length > 0 && (
        <>
          <h3>Overall Marketing Score Trend</h3>
          <ProgressChart data={history} />
        </>
      )}

      {report && (
        <>
          <h2 style={{ marginTop: 24 }}>Executive Summary</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <ScoreCard label="Overall Marketing" value={`${report.overall_marketing_score}/100`} />
            <ScoreCard label="Competitive Advantage" value={`${report.competitive_advantage_score}/100`} />
            <ScoreCard label="Growth Potential" value={`${report.growth_potential_score}/100`} />
          </div>
          <p className="card" style={{ marginTop: 12 }}>{report.executive_summary}</p>

          <ActionList title="Priority Actions (Top 5)" items={report.priority_actions} />
          <ActionList title="Immediate Actions (Next 7 Days)" items={report.immediate_actions} />
          <ActionList title="Medium-Term Actions (30 Days)" items={report.medium_term_actions} />
          <ActionList title="Long-Term Actions (90 Days+)" items={report.long_term_actions} />
          <ActionList title="Content Pillars" items={report.content_pillars} />
        </>
      )}
    </AppLayout>
  );
}

function ActionList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <>
      <h3>{title}</h3>
      <ul className="card" style={{ margin: 0, paddingLeft: "1.5rem" }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 6 }}>{item}</li>
        ))}
      </ul>
    </>
  );
}
