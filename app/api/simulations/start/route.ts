import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const schema = z.object({ user_id: z.string().uuid(), scenario_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const payload = schema.parse(await req.json());

  const { data: scenario, error: sError } = await supabaseAdmin.from("scenarios").select("*").eq("id", payload.scenario_id).single();
  if (sError) return NextResponse.json({ error: sError.message }, { status: 404 });

  const { data: simulation, error: simError } = await supabaseAdmin
    .from("simulations")
    .insert({ user_id: payload.user_id, scenario_id: payload.scenario_id, difficulty: scenario.difficulty })
    .select("id")
    .single();

  if (simError) return NextResponse.json({ error: simError.message }, { status: 500 });

  await supabaseAdmin.from("messages").insert({
    simulation_id: simulation.id,
    sender: "ai_client",
    message: scenario.opening_message
  });

  return NextResponse.json({ simulation_id: simulation.id, opening_message: scenario.opening_message, scenario });
}
