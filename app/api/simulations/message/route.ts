import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { generateClientReply } from "@/lib/ai";

const schema = z.object({ simulation_id: z.string().uuid(), user_message: z.string().min(1) });

export async function POST(req: NextRequest) {
  const payload = schema.parse(await req.json());

  await supabaseAdmin.from("messages").insert({
    simulation_id: payload.simulation_id,
    sender: "trainee",
    message: payload.user_message
  });

  const { data: simulation } = await supabaseAdmin
    .from("simulations")
    .select("scenario_id, scenarios(*)")
    .eq("id", payload.simulation_id)
    .single();

  const { data: transcript } = await supabaseAdmin
    .from("messages")
    .select("sender,message")
    .eq("simulation_id", payload.simulation_id)
    .order("timestamp", { ascending: true });

  const reply = await generateClientReply({
    scenario: simulation?.scenarios,
    transcript: transcript ?? []
  });

  await supabaseAdmin.from("messages").insert({
    simulation_id: payload.simulation_id,
    sender: "ai_client",
    message: reply
  });

  return NextResponse.json({ reply });
}
