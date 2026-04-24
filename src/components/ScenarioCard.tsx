"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuxuryButton } from "./LuxuryButton";
import { difficultyLabel, roleLabel } from "@/lib/format";
import type { Scenario } from "@/types/database";

export function ScenarioCard({
  scenario,
  disabled,
}: {
  scenario: Scenario;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const res = await fetch("/api/simulations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: scenario.id }),
      });
      if (!res.ok) throw new Error("Could not start");
      const { simulation } = await res.json();
      router.push(`/simulation/${simulation.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-luxe border border-anchor/10 bg-white p-6 flex flex-col shadow-quiet hover:shadow-hover transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-luxe uppercase text-bronze">
          {scenario.category}
        </span>
        <span className="text-[11px] tracking-luxe text-champagne uppercase">
          {difficultyLabel(scenario.difficulty)}
        </span>
      </div>
      <h3 className="font-display text-xl mt-3 text-anchor">{scenario.title}</h3>
      <p className="text-sm text-bronze mt-2 line-clamp-3">{scenario.scenario_context}</p>
      <div className="mt-4 text-xs text-bronze/80 italic">
        Role tested: {roleLabel(scenario.role_target)}
      </div>
      <div className="mt-5">
        <LuxuryButton onClick={start} disabled={loading || disabled} size="sm">
          {loading ? "Preparing…" : "Begin Simulation"}
        </LuxuryButton>
      </div>
    </div>
  );
}
