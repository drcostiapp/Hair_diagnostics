import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data: user } = await supabaseAdmin.from("users").select("*").eq("id", params.id).single();
  const { data: simulations } = await supabaseAdmin
    .from("simulations")
    .select("*, evaluations(*)")
    .eq("user_id", params.id)
    .order("started_at", { ascending: false });

  return NextResponse.json({ user, simulations });
}
