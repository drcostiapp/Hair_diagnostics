import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await requireUser();
  if (me.role !== "manager" && me.id !== params.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = supabaseAdmin();

  const { data: user } = await admin.from("users").select("*").eq("id", params.id).single();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: sims } = await admin
    .from("simulations")
    .select("id, scenario_id, status, started_at, ended_at, final_score, pass_fail, difficulty")
    .eq("user_id", params.id)
    .order("started_at", { ascending: false });

  const { data: evals } = await admin
    .from("evaluations")
    .select(
      "simulation_id, tone_score, sop_score, brevity_score, emotional_score, discipline_score, luxury_violations, recommendation",
    )
    .in(
      "simulation_id",
      (sims ?? []).map((s) => s.id),
    );

  const { data: cert } = await admin
    .from("certifications")
    .select("*")
    .eq("user_id", params.id)
    .eq("role", user.role)
    .maybeSingle();

  const { data: scenarios } = await admin
    .from("scenarios")
    .select("id, title, category, difficulty")
    .in(
      "id",
      (sims ?? []).map((s) => s.scenario_id),
    );

  return NextResponse.json({
    user,
    simulations: sims ?? [],
    evaluations: evals ?? [],
    certification: cert,
    scenarios: scenarios ?? [],
  });
}
