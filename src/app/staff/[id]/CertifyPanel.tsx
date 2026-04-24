"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuxuryButton } from "@/components/LuxuryButton";
import { certificationLabel } from "@/lib/format";

export function CertifyPanel({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/manager/certify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, status, notes }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-luxe border border-anchor/10 bg-white p-6 shadow-quiet">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-luxe uppercase text-bronze">
            Manager Certification
          </div>
          <div className="font-display text-xl text-anchor mt-1">
            Current: {certificationLabel(currentStatus)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-5">
        <label className="flex flex-col text-sm">
          <span className="text-[11px] tracking-luxe uppercase text-bronze mb-1">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-ivory-warm border border-linen rounded-luxe px-3 py-2 outline-none focus:border-champagne"
          >
            <option value="in_progress">In Training</option>
            <option value="certified">Certified</option>
            <option value="needs_retraining">Needs Retraining</option>
          </select>
        </label>

        <label className="flex flex-col text-sm md:col-span-2">
          <span className="text-[11px] tracking-luxe uppercase text-bronze mb-1">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Private notes for the staff file."
            className="bg-ivory-warm border border-linen rounded-luxe px-3 py-2 outline-none focus:border-champagne resize-none"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <LuxuryButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Update Certification"}
        </LuxuryButton>
        {saved && <span className="text-xs text-champagne tracking-luxe uppercase">Saved</span>}
      </div>
    </div>
  );
}
