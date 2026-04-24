"use client";

import { useMemo, useState } from "react";
import { ScenarioCard } from "@/components/ScenarioCard";
import { difficultyLabel, roleLabel } from "@/lib/format";
import type { Scenario, UserRole } from "@/types/database";

const ROLES: (UserRole | "all")[] = [
  "all",
  "whatsapp_agent",
  "receptionist",
  "hostess",
  "valet",
  "nurse",
];
const DIFFICULTIES = [0, 1, 2, 3, 4, 5] as const;
const STATUS = ["all", "not_attempted", "pass", "fail"] as const;

export function ScenariosBrowser({
  scenarios,
  attempts,
  defaultRole,
}: {
  scenarios: Scenario[];
  attempts: Record<string, { pass: boolean; fail: boolean }>;
  defaultRole: string | null;
}) {
  const [role, setRole] = useState<string>(defaultRole ?? "all");
  const [difficulty, setDifficulty] = useState<number>(0);
  const [status, setStatus] = useState<(typeof STATUS)[number]>("all");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(scenarios.map((s) => s.category))).sort()],
    [scenarios],
  );

  const filtered = useMemo(() => {
    return scenarios.filter((s) => {
      if (role !== "all" && s.role_target !== role) return false;
      if (difficulty !== 0 && s.difficulty !== difficulty) return false;
      if (category !== "all" && s.category !== category) return false;
      if (status !== "all") {
        const a = attempts[s.id];
        if (status === "not_attempted" && a) return false;
        if (status === "pass" && !a?.pass) return false;
        if (status === "fail" && !a?.fail) return false;
      }
      return true;
    });
  }, [scenarios, role, difficulty, status, category, attempts]);

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-end bg-white border border-anchor/10 rounded-luxe p-4 shadow-quiet">
        <Filter label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-ivory-warm border border-linen rounded-luxe px-3 py-2 text-sm outline-none focus:border-champagne"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All Roles" : roleLabel(r)}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Difficulty">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="bg-ivory-warm border border-linen rounded-luxe px-3 py-2 text-sm outline-none focus:border-champagne"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d === 0 ? "Any" : difficultyLabel(d)}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-ivory-warm border border-linen rounded-luxe px-3 py-2 text-sm outline-none focus:border-champagne"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Outcome">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUS)[number])}
            className="bg-ivory-warm border border-linen rounded-luxe px-3 py-2 text-sm outline-none focus:border-champagne"
          >
            <option value="all">All</option>
            <option value="not_attempted">Not Attempted</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
          </select>
        </Filter>
      </div>

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-luxe border border-anchor/10 bg-ivory-warm p-8 text-center text-bronze text-sm">
            No scenarios match these filters.
          </div>
        )}
      </div>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] tracking-luxe uppercase text-bronze mb-1">{label}</span>
      {children}
    </div>
  );
}
