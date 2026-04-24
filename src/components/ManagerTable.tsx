"use client";

import Link from "next/link";
import { CertificationBadge } from "./CertificationBadge";
import { roleLabel, formatDate } from "@/lib/format";
import type { StaffRow } from "@/app/api/dashboard/staff/route";

export function ManagerTable({ rows }: { rows: StaffRow[] }) {
  return (
    <div className="rounded-luxe border border-anchor/10 bg-white shadow-quiet overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ivory-warm text-bronze text-[11px] tracking-luxe uppercase">
          <tr>
            <th className="text-left px-5 py-3 font-medium">Name</th>
            <th className="text-left px-5 py-3 font-medium">Role</th>
            <th className="text-left px-5 py-3 font-medium">Certification</th>
            <th className="text-right px-5 py-3 font-medium">Completed</th>
            <th className="text-right px-5 py-3 font-medium">Failed</th>
            <th className="text-right px-5 py-3 font-medium">Avg Score</th>
            <th className="text-right px-5 py-3 font-medium">Violations</th>
            <th className="text-right px-5 py-3 font-medium">Last</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-10 text-center text-bronze">
                No staff records yet.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-anchor/5 hover:bg-ivory-warm/60">
              <td className="px-5 py-3">
                <Link
                  href={`/staff/${r.id}`}
                  className="text-anchor hover:text-champagne transition-colors"
                >
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-bronze">{r.email}</div>
                </Link>
              </td>
              <td className="px-5 py-3 text-anchor/80">{roleLabel(r.role)}</td>
              <td className="px-5 py-3">
                <CertificationBadge status={r.certification_status} />
              </td>
              <td className="px-5 py-3 text-right">{r.simulations_completed}</td>
              <td className="px-5 py-3 text-right">
                {r.simulations_failed > 0 ? (
                  <span className="text-[#7A2E2E]">{r.simulations_failed}</span>
                ) : (
                  r.simulations_failed
                )}
              </td>
              <td className="px-5 py-3 text-right font-display text-lg text-anchor">
                {r.average_score ?? "—"}
              </td>
              <td className="px-5 py-3 text-right">{r.luxury_violations}</td>
              <td className="px-5 py-3 text-right text-xs text-bronze">
                {r.last_simulation_at ? formatDate(r.last_simulation_at) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
