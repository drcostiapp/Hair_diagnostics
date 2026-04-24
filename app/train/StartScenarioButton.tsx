"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartScenarioButton({
  scenarioId,
}: {
  scenarioId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: scenarioId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const { simulation_id } = await res.json();
      router.push(`/train/${simulation_id}`);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={start}
        disabled={loading}
        className="w-full rounded-full bg-anchor py-2.5 text-xs uppercase tracking-widest text-ivory transition hover:bg-anchor-soft disabled:opacity-50"
      >
        {loading ? "Opening chat…" : "Begin rehearsal"}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </>
  );
}
