import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn("Supabase env vars are not fully configured.");
}

export const supabaseAdmin = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: { persistSession: false }
});
