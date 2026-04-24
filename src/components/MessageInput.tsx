"use client";

import { useState, KeyboardEvent } from "react";
import { LuxuryButton } from "./LuxuryButton";

export function MessageInput({
  onSend,
  disabled,
  placeholder = "Write your reply — calm, brief, elegant.",
}: {
  onSend: (msg: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const msg = value.trim();
    if (!msg || disabled || sending) return;
    setSending(true);
    setValue("");
    try {
      await onSend(msg);
    } finally {
      setSending(false);
    }
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-linen/70 bg-ivory-warm px-4 py-3 flex gap-3 items-end">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        placeholder={placeholder}
        disabled={disabled || sending}
        className="flex-1 resize-none bg-white border border-linen rounded-luxe px-4 py-2.5 text-[14px] outline-none focus:border-champagne transition-colors min-h-[44px] max-h-[140px] luxe-scroll"
        style={{ lineHeight: "1.5" }}
      />
      <LuxuryButton onClick={handleSend} disabled={!value.trim() || disabled || sending} size="md">
        {sending ? "…" : "Send"}
      </LuxuryButton>
    </div>
  );
}
