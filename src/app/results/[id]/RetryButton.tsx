"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuxuryButton } from "@/components/LuxuryButton";

export function RetryButton({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function retry() {
    setLoading(true);
    try {
      const res = await fetch("/api/simulations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: scenarioId }),
      });
      if (!res.ok) throw new Error();
      const { simulation } = await res.json();
      router.push(`/simulation/${simulation.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <LuxuryButton onClick={retry} disabled={loading}>
      {loading ? "Preparing…" : "Retry Scenario"}
    </LuxuryButton>
  );
}
