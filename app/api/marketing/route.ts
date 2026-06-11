import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { analyzeMarketing } from "@/lib/ai";

const schema = z.object({
  business: z.string().min(1).default("Dr. Costi House of Beauty"),
  campaign_data: z.unknown(),
  competitors: z.unknown().optional()
});

export async function POST(req: NextRequest) {
  const payload = schema.parse(await req.json());

  const report = await analyzeMarketing({
    business: payload.business,
    campaign_data: payload.campaign_data,
    competitors: payload.competitors
  });

  const { data: saved } = await supabaseAdmin
    .from("marketing_reports")
    .insert({
      business: payload.business,
      campaign_input: { campaign_data: payload.campaign_data, competitors: payload.competitors ?? null },
      overall_marketing_score: report.overall_marketing_score,
      competitive_advantage_score: report.competitive_advantage_score,
      growth_potential_score: report.growth_potential_score,
      executive_summary: report.executive_summary,
      immediate_actions: report.immediate_actions,
      medium_term_actions: report.medium_term_actions,
      long_term_actions: report.long_term_actions,
      content_pillars: report.content_pillars,
      priority_actions: report.priority_actions
    })
    .select("id")
    .single();

  return NextResponse.json({ id: saved?.id ?? null, report });
}

export async function GET() {
  const { data: reports } = await supabaseAdmin
    .from("marketing_reports")
    .select("id,created_at,overall_marketing_score,competitive_advantage_score,growth_potential_score")
    .order("created_at", { ascending: true });

  return NextResponse.json({ reports: reports ?? [] });
}
