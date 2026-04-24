import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { runClientSimulatorTurn } from "@/lib/ai/client-simulator";
import type { ChatMessage, Scenario } from "@/types/database";

const bodySchema = z.object({
  simulation_id: z.string().uuid(),
  user_message: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const user = await requireUser();

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const { data: sim } = await admin
    .from("simulations")
    .select("*, scenarios(*)")
    .eq("id", parsed.data.simulation_id)
    .single();

  if (!sim || sim.user_id !== user.id) {
    return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
  }

  if (sim.status !== "in_progress") {
    return NextResponse.json({ error: "Simulation already ended" }, { status: 400 });
  }

  await admin.from("messages").insert({
    simulation_id: sim.id,
    sender: "trainee",
    message: parsed.data.user_message,
  });

  const { data: history } = await admin
    .from("messages")
    .select("sender, message")
    .eq("simulation_id", sim.id)
    .order("created_at", { ascending: true });

  const scenario = sim.scenarios as unknown as Scenario;
  const trimmedHistory = (history ?? []).slice(0, -1) as Pick<
    ChatMessage,
    "sender" | "message"
  >[];

  let aiReply = "";
  try {
    aiReply = await runClientSimulatorTurn({
      scenario,
      history: trimmedHistory,
      traineeMessage: parsed.data.user_message,
    });
  } catch (err) {
    console.error("[simulator] generation failed", err);
    return NextResponse.json(
      { error: "Simulator is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }

  const { data: aiMessage } = await admin
    .from("messages")
    .insert({
      simulation_id: sim.id,
      sender: "ai_client",
      message: aiReply,
    })
    .select("*")
    .single();

  return NextResponse.json({ message: aiMessage });
}
