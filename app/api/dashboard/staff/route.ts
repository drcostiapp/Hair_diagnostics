import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data: users } = await supabaseAdmin.from("users").select("id,name,role,certification_status");
  const { data: simulations } = await supabaseAdmin.from("simulations").select("user_id,final_score,pass_fail");

  const byUser = new Map<string, { scores: number[]; fails: number }>();
  for (const sim of simulations ?? []) {
    const row = byUser.get(sim.user_id) ?? { scores: [], fails: 0 };
    if (sim.final_score !== null) row.scores.push(sim.final_score);
    if (sim.pass_fail === "FAIL") row.fails += 1;
    byUser.set(sim.user_id, row);
  }

  const summary = (users ?? []).map((u) => {
    const stats = byUser.get(u.id) ?? { scores: [], fails: 0 };
    const avg = stats.scores.length ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) : null;
    return { ...u, average_score: avg, failed_scenarios: stats.fails };
  });

  return NextResponse.json({ summary });
}
