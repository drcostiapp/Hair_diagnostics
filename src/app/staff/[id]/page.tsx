import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppLayout } from "@/components/AppLayout";
import { StaffProfileCard } from "@/components/StaffProfileCard";
import { ProgressChart } from "@/components/ProgressChart";
import { CertifyPanel } from "./CertifyPanel";
import { difficultyLabel, formatDate } from "@/lib/format";
import type { AppUser, Certification, Scenario, Simulation } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
  const viewer = await requireUser();
  if (viewer.role !== "manager" && viewer.id !== params.id) redirect("/dashboard");

  const admin = supabaseAdmin();

  const { data: staff } = await admin.from("users").select("*").eq("id", params.id).single();
  if (!staff) notFound();
  const staffUser = staff as AppUser;

  const { data: sims } = await admin
    .from("simulations")
    .select("*")
    .eq("user_id", staffUser.id)
    .order("started_at", { ascending: false });

  const { data: scenarios } = await admin
    .from("scenarios")
    .select("id, title, category, difficulty")
    .in(
      "id",
      (sims ?? []).map((s) => s.scenario_id),
    );

  const { data: cert } = await admin
    .from("certifications")
    .select("*")
    .eq("user_id", staffUser.id)
    .eq("role", staffUser.role)
    .maybeSingle();

  const completed = (sims ?? []).filter((s) => s.status === "completed");
  const trend = completed
    .slice()
    .reverse()
    .map((s) => s.final_score ?? 0);

  const scenariosMap = new Map<string, Pick<Scenario, "id" | "title" | "category" | "difficulty">>(
    (scenarios ?? []).map((s) => [s.id as string, s]),
  );

  // Weakness pattern: top-3 failing categories
  const failCounts = new Map<string, number>();
  completed
    .filter((s) => s.pass_fail === "FAIL")
    .forEach((s) => {
      const sc = scenariosMap.get(s.scenario_id);
      if (!sc) return;
      failCounts.set(sc.category, (failCounts.get(sc.category) ?? 0) + 1);
    });
  const weaknessPattern = Array.from(failCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <AppLayout user={viewer}>
      <div className="flex items-center gap-2 text-xs text-bronze">
        {viewer.role === "manager" && (
          <Link href="/manager" className="hover:text-anchor">
            ← Manager Dashboard
          </Link>
        )}
      </div>

      <div className="mt-4">
        <StaffProfileCard user={staffUser} certification={(cert as Certification) ?? null} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <ProgressChart scores={trend} />
        <div className="rounded-luxe border border-anchor/10 bg-white p-5 shadow-quiet">
          <div className="text-[11px] tracking-luxe uppercase text-bronze mb-3">
            Weakness Pattern
          </div>
          {weaknessPattern.length === 0 ? (
            <div className="text-sm text-bronze">No repeating failure pattern.</div>
          ) : (
            <ul className="space-y-2">
              {weaknessPattern.map(([cat, count]) => (
                <li
                  key={cat}
                  className="flex items-center justify-between text-sm border-b border-linen/70 pb-2 last:border-0"
                >
                  <span className="text-anchor">{cat}</span>
                  <span className="text-[#7A2E2E] text-xs">
                    {count} fail{count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {viewer.role === "manager" && (
        <div className="mt-6">
          <CertifyPanel userId={staffUser.id} currentStatus={staffUser.certification_status} />
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl text-anchor">Training History</h2>
        <div className="mt-4 rounded-luxe border border-anchor/10 bg-white shadow-quiet overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ivory-warm text-bronze text-[11px] tracking-luxe uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Scenario</th>
                <th className="text-left px-5 py-3 font-medium">Difficulty</th>
                <th className="text-right px-5 py-3 font-medium">Score</th>
                <th className="text-right px-5 py-3 font-medium">Outcome</th>
                <th className="text-right px-5 py-3 font-medium">Date</th>
                <th className="text-right px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(sims ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-bronze">
                    No training history yet.
                  </td>
                </tr>
              )}
              {(sims ?? []).map((s) => {
                const sim = s as Simulation;
                const sc = scenariosMap.get(sim.scenario_id);
                return (
                  <tr key={sim.id} className="border-t border-anchor/5">
                    <td className="px-5 py-3">
                      <div className="font-medium text-anchor">{sc?.title ?? "Scenario"}</div>
                      <div className="text-xs text-bronze">{sc?.category ?? ""}</div>
                    </td>
                    <td className="px-5 py-3 text-anchor/80">
                      {sc ? difficultyLabel(sc.difficulty) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-display text-lg text-anchor">
                      {sim.final_score ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {sim.pass_fail === "PASS" ? (
                        <span className="text-champagne text-xs tracking-luxe uppercase">
                          Pass
                        </span>
                      ) : sim.pass_fail === "FAIL" ? (
                        <span className="text-[#7A2E2E] text-xs tracking-luxe uppercase">
                          Fail
                        </span>
                      ) : (
                        <span className="text-bronze text-xs">In progress</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-bronze">
                      {sim.ended_at ? formatDate(sim.ended_at) : formatDate(sim.started_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {sim.status === "completed" ? (
                        <Link
                          href={`/results/${sim.id}`}
                          className="text-xs text-anchor hover:text-champagne"
                        >
                          Review →
                        </Link>
                      ) : (
                        <Link
                          href={`/simulation/${sim.id}`}
                          className="text-xs text-anchor hover:text-champagne"
                        >
                          Resume →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}
