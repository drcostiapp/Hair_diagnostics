import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const scenarioSchema = z.object({
  title: z.string(),
  category: z.string(),
  difficulty: z.number().int().min(1).max(5),
  role_target: z.enum(["manager", "receptionist", "whatsapp_agent", "hostess", "nurse", "valet"]),
  scenario_context: z.string(),
  client_personality: z.string(),
  opening_message: z.string(),
  expected_behavior: z.string(),
  gold_standard_response: z.string(),
  fail_triggers: z.array(z.string()),
  sop_reference: z.string()
});

export async function GET() {
  const { data, error } = await supabaseAdmin.from("scenarios").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scenarios: data });
}

export async function POST(req: NextRequest) {
  const payload = scenarioSchema.parse(await req.json());
  const { data, error } = await supabaseAdmin.from("scenarios").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scenario: data }, { status: 201 });
}
