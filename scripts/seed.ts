/* eslint-disable no-console */
/**
 * Seed script.
 *
 * Usage:
 *   pnpm tsx scripts/seed.ts          # scenarios only
 *   pnpm tsx scripts/seed.ts --users  # also create demo users
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seedScenarios() {
  const sql = readFileSync(join(process.cwd(), "supabase", "seed.sql"), "utf-8");
  // Execute via rpc if defined, otherwise instruct user.
  console.log("Run supabase/seed.sql in the Supabase SQL editor to insert scenarios.");
  console.log(
    "(Supabase JS client does not execute raw multi-statement SQL from the service role key.)",
  );
  console.log("SQL bytes:", sql.length);
}

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role:
    | "manager"
    | "receptionist"
    | "whatsapp_agent"
    | "hostess"
    | "nurse"
    | "valet";
}

const DEMO_USERS: DemoUser[] = [
  {
    email: "manager@drcosti.local",
    password: "ChangeMe!2026",
    name: "Studio Manager",
    role: "manager",
  },
  {
    email: "whatsapp@drcosti.local",
    password: "ChangeMe!2026",
    name: "Nour WhatsApp",
    role: "whatsapp_agent",
  },
  {
    email: "reception@drcosti.local",
    password: "ChangeMe!2026",
    name: "Lara Reception",
    role: "receptionist",
  },
  {
    email: "hostess@drcosti.local",
    password: "ChangeMe!2026",
    name: "Maya Hostess",
    role: "hostess",
  },
  {
    email: "valet@drcosti.local",
    password: "ChangeMe!2026",
    name: "Elie Valet",
    role: "valet",
  },
  {
    email: "nurse@drcosti.local",
    password: "ChangeMe!2026",
    name: "Rima Nurse",
    role: "nurse",
  },
];

async function seedUsers() {
  for (const u of DEMO_USERS) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });

    let authId: string | null = null;
    if (error && !/already/i.test(error.message)) {
      console.warn(`auth: ${u.email} ->`, error.message);
      continue;
    }
    if (created?.user) authId = created.user.id;

    if (!authId) {
      // Look up existing
      const { data: list } = await admin.auth.admin.listUsers();
      authId = list?.users.find((x) => x.email === u.email)?.id ?? null;
    }

    if (!authId) continue;

    await admin.from("users").upsert(
      {
        auth_id: authId,
        email: u.email,
        name: u.name,
        role: u.role,
        status: "active",
      },
      { onConflict: "email" },
    );
    console.log("✔", u.email, "→", u.role);
  }
}

async function main() {
  await seedScenarios();
  if (process.argv.includes("--users")) {
    await seedUsers();
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
