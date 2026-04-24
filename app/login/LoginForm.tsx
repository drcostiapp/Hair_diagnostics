"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, type StaffRole } from "@/lib/types";

const ROLES: StaffRole[] = [
  "receptionist",
  "whatsapp_agent",
  "hostess",
  "nurse",
  "valet",
  "manager",
];

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const nextPath = params.get("next") || "/train";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<StaffRole>("receptionist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(nextPath);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        setInfo(
          "Check your email to confirm your access. You can sign in once confirmed.",
        );
        setMode("signin");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-anchor/10 bg-ivory-soft p-8 shadow-card"
    >
      <div className="mb-6 flex gap-2 text-xs uppercase tracking-widest">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full py-2 transition ${
            mode === "signin"
              ? "bg-anchor text-ivory"
              : "text-anchor/60 hover:text-anchor"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 transition ${
            mode === "signup"
              ? "bg-anchor text-ivory"
              : "text-anchor/60 hover:text-anchor"
          }`}
        >
          Request access
        </button>
      </div>

      {mode === "signup" && (
        <>
          <Field
            label="Full name"
            value={fullName}
            onChange={setFullName}
            required
          />
          <label className="mb-4 block">
            <span className="mb-1 block text-xs uppercase tracking-widest text-anchor/60">
              Role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="w-full rounded-lg border border-anchor/15 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {info && (
        <p className="mb-4 rounded-lg bg-ivory-deep px-3 py-2 text-xs text-anchor/80">
          {info}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-anchor py-3 text-sm font-medium tracking-wide text-ivory transition hover:bg-anchor-soft disabled:opacity-50"
      >
        {loading
          ? "Please wait…"
          : mode === "signin"
            ? "Sign in"
            : "Request access"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-anchor/60">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-anchor/15 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}
