import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireManager } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const bodySchema = z.object({
  user_id: z.string().uuid(),
  status: z.enum(["certified", "needs_retraining", "in_progress"]),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const manager = await requireManager();
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const admin = supabaseAdmin();

  const { data: user } = await admin
    .from("users")
    .select("id, role")
    .eq("id", parsed.data.user_id)
    .single();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const certifiedAt = parsed.data.status === "certified" ? new Date().toISOString() : null;

  await admin.from("certifications").upsert(
    {
      user_id: user.id,
      role: user.role,
      certification_status: parsed.data.status,
      certified_at: certifiedAt,
      manager_notes: parsed.data.notes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,role" },
  );

  await admin
    .from("users")
    .update({ certification_status: parsed.data.status })
    .eq("id", user.id);

  return NextResponse.json({ ok: true, by: manager.id });
}
