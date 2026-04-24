import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ROLE_LABELS, type UserProfile } from "@/lib/types";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

interface ScoreboardRow {
  user_id: string;
  full_name: string;
  role: UserProfile["role"];
  simulations_completed: number;
  avg_score: number;
  pass_rate: number;
  last_simulation_at: string | null;
}

interface RecentEval {
  id: string;
  user_id: string;
  created_at: string;
  total_score: number;
  passed: boolean;
  auto_fail: boolean;
  recommended_module: string | null;
  users: { full_name: string; role: UserProfile["role"] } | null;
  simulations:
    | { scenario_id: string; scenarios: { title: string } | null }
    | null;
}

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (!(profile as UserProfile).is_manager) redirect("/train");

  const [{ data: board }, { data: recent }] = await Promise.all([
    supabase
      .from("staff_scoreboard")
      .select("*")
      .order("avg_score", { ascending: false }),
    supabase
      .from("evaluations")
      .select(
        "id, user_id, created_at, total_score, passed, auto_fail, recommended_module, users(full_name, role), simulations(scenario_id, scenarios(title))",
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const scoreboard = (board ?? []) as ScoreboardRow[];
  const recentEvals = (recent ?? []) as unknown as RecentEval[];

  return (
    <>
      <Header profile={profile as UserProfile} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">
          Manager view
        </p>
        <h1 className="mt-2 font-display text-4xl text-anchor">
          Staff performance
        </h1>
        <div className="gold-divider my-6 w-48" />

        <section className="mb-10">
          <h2 className="mb-3 font-display text-2xl text-anchor">
            Scoreboard
          </h2>
          <div className="overflow-hidden rounded-2xl border border-anchor/10 bg-ivory-soft shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-anchor text-ivory">
                  <Th>Staff</Th>
                  <Th>Role</Th>
                  <Th className="text-right">Completed</Th>
                  <Th className="text-right">Avg score</Th>
                  <Th className="text-right">Pass rate</Th>
                  <Th className="text-right">Certification</Th>
                </tr>
              </thead>
              <tbody>
                {scoreboard.map((row) => {
                  const cert = certificationLevel(row);
                  return (
                    <tr
                      key={row.user_id}
                      className="border-t border-anchor/10"
                    >
                      <Td>{row.full_name}</Td>
                      <Td>{ROLE_LABELS[row.role]}</Td>
                      <Td className="text-right">
                        {row.simulations_completed}
                      </Td>
                      <Td className="text-right">{row.avg_score}</Td>
                      <Td className="text-right">{row.pass_rate}%</Td>
                      <Td className="text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${cert.bg}`}
                        >
                          {cert.label}
                        </span>
                      </Td>
                    </tr>
                  );
                })}
                {scoreboard.length === 0 && (
                  <tr>
                    <Td colSpan={6} className="text-center text-anchor/50">
                      No staff data yet.
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-2xl text-anchor">
            Recent simulations
          </h2>
          <div className="overflow-hidden rounded-2xl border border-anchor/10 bg-ivory-soft shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-anchor text-ivory">
                  <Th>Staff</Th>
                  <Th>Scenario</Th>
                  <Th className="text-right">Score</Th>
                  <Th className="text-right">Status</Th>
                  <Th>Weakness</Th>
                  <Th>When</Th>
                </tr>
              </thead>
              <tbody>
                {recentEvals.map((e) => (
                  <tr key={e.id} className="border-t border-anchor/10">
                    <Td>{e.users?.full_name ?? "—"}</Td>
                    <Td>{e.simulations?.scenarios?.title ?? "—"}</Td>
                    <Td className="text-right">{e.total_score}</Td>
                    <Td className="text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                          e.passed
                            ? "bg-anchor/10 text-anchor"
                            : "bg-red-800/10 text-red-800"
                        }`}
                      >
                        {e.passed ? "Pass" : e.auto_fail ? "Auto fail" : "Fail"}
                      </span>
                    </Td>
                    <Td>{e.recommended_module ?? "—"}</Td>
                    <Td>{new Date(e.created_at).toLocaleDateString()}</Td>
                  </tr>
                ))}
                {recentEvals.length === 0 && (
                  <tr>
                    <Td colSpan={6} className="text-center text-anchor/50">
                      No evaluations yet.
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

function certificationLevel(row: ScoreboardRow) {
  if (row.simulations_completed >= 20 && row.avg_score >= 90)
    return { label: "Gold", bg: "bg-gold/20 text-gold-dark" };
  if (row.simulations_completed >= 10 && row.avg_score >= 80)
    return { label: "Certified", bg: "bg-anchor/10 text-anchor" };
  if (row.simulations_completed >= 3)
    return { label: "In progress", bg: "bg-anchor/5 text-anchor/70" };
  return { label: "Untrained", bg: "bg-red-800/10 text-red-800" };
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest ${className}`}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
