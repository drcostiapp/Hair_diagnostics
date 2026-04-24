"use client";

import { useState } from "react";

export function MessageInput({ onSend }: { onSend: (value: string) => Promise<void> }) {
  const [value, setValue] = useState("");

  return (
    <div className="input-row">
      <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Write a precise, elegant reply..." />
      <button
        className="btn btn-dark"
        onClick={async () => {
          if (!value.trim()) return;
          await onSend(value.trim());
          setValue("");
        }}
      >
        Send
      </button>
    </div>
  );
}
