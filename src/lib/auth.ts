import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AppUser } from "@/types/database";

/**
 * Returns the currently authenticated AppUser row, or null.
 * Uses the session from cookies, then fetches the users row via service role
 * (RLS-safe on our side; we only return the row belonging to that auth_id).
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle();

  return (data as AppUser) ?? null;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireManager(): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== "manager") redirect("/dashboard");
  return user;
}
