"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LuxuryButton } from "@/components/LuxuryButton";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-[11px] tracking-luxe uppercase text-bronze">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full bg-white border border-linen rounded-luxe px-4 py-2.5 text-sm outline-none focus:border-champagne"
          placeholder="you@drcosti.com"
        />
      </div>

      <div>
        <label className="text-[11px] tracking-luxe uppercase text-bronze">Password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full bg-white border border-linen rounded-luxe px-4 py-2.5 text-sm outline-none focus:border-champagne"
        />
      </div>

      {error && (
        <div className="text-xs text-[#7A2E2E] bg-[#FBECEC] border border-[#E9C9C9] rounded-luxe px-3 py-2">
          {error}
        </div>
      )}

      <LuxuryButton type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Continue"}
      </LuxuryButton>

      <p className="text-[11px] text-bronze/70 text-center mt-4">
        Access is issued by your manager.
      </p>
    </form>
  );
}
