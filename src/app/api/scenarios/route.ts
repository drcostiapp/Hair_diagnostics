import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, requireManager } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  await requireUser();
  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const category = url.searchParams.get("category");
  const difficulty = url.searchParams.get("difficulty");

  const admin = supabaseAdmin();
  let query = admin
    .from("scenarios")
    .select("*")
    .eq("is_active", true)
    .order("difficulty", { ascending: true });

  if (role) query = query.eq("role_target", role);
  if (category) query = query.eq("category", category);
  if (difficulty) query = query.eq("difficulty", Number(difficulty));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scenarios: data ?? [] });
}

const createSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  difficulty: z.number().int().min(1).max(5),
  role_target: z.string().min(2),
  scenario_context: z.string().min(5),
  client_personality: z.string().optional(),
  opening_message: z.string().min(5),
  expected_behavior: z.string().optional(),
  gold_standard_response: z.string().optional(),
  fail_triggers: z.array(z.string()).optional(),
  sop_reference: z.string().optional(),
});

export async function POST(req: NextRequest) {
  await requireManager();
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("scenarios")
    .insert({
      ...parsed.data,
      fail_triggers: parsed.data.fail_triggers ?? [],
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ scenario: data });
}
