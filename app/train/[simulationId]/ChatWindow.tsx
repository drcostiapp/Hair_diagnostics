"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Message, Scenario } from "@/lib/types";

export default function ChatWindow({
  simulationId,
  scenario,
  initialMessages,
}: {
  simulationId: string;
  scenario: Scenario;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);

    // Optimistic render
    const tempId = `temp-${Date.now()}`;
    setMessages((m) => [
      ...m,
      {
        id: tempId,
        simulation_id: simulationId,
        sender: "trainee",
        content: text,
        created_at: new Date().toISOString(),
      },
    ]);
    setDraft("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_id: simulationId, content: text }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Send failed");
      const { trainee_message, ai_message } = await res.json();
      setMessages((m) => [
        ...m.filter((x) => x.id !== tempId),
        trainee_message,
        ai_message,
      ]);
    } catch (e: any) {
      setError(e.message);
      setMessages((m) => m.filter((x) => x.id !== tempId));
    } finally {
      setSending(false);
    }
  }

  async function endSimulation() {
    if (ending) return;
    setEnding(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_id: simulationId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Scoring failed");
      router.push(`/results/${simulationId}`);
    } catch (e: any) {
      setError(e.message);
      setEnding(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-anchor/10 bg-ivory-soft shadow-luxe">
      {/* Chat header strip */}
      <div className="flex items-center justify-between border-b border-anchor/10 bg-anchor px-4 py-3 text-ivory">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 font-display text-gold">
            C
          </div>
          <div>
            <div className="text-sm font-medium">Private client</div>
            <div className="text-[10px] uppercase tracking-widest text-ivory/60">
              WhatsApp · training
            </div>
          </div>
        </div>
        <button
          onClick={endSimulation}
          disabled={ending || messages.length < 2}
          className="rounded-full border border-ivory/30 px-4 py-1.5 text-[10px] uppercase tracking-widest text-ivory/90 hover:border-gold hover:text-gold disabled:opacity-40"
        >
          {ending ? "Scoring…" : "End & score"}
        </button>
      </div>

      {/* Scroll area */}
      <div
        ref={scrollRef}
        className="chat-scroll h-[60vh] overflow-y-auto bg-ivory px-4 py-6"
      >
        <div className="mx-auto flex max-w-xl flex-col gap-3">
          {messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {sending && (
            <div className="self-start text-xs italic text-anchor/40">
              client is typing…
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-anchor/10 bg-ivory-soft px-3 py-3">
        {error && (
          <p className="mb-2 text-xs text-red-700">{error}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder="Reply as clinic staff…"
            className="min-h-[44px] flex-1 resize-none rounded-2xl border border-anchor/15 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !draft.trim()}
            className="rounded-full bg-anchor px-5 py-3 text-xs uppercase tracking-widest text-ivory transition hover:bg-anchor-soft disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-anchor/40">
          Level {scenario.difficulty} · {scenario.title}
        </p>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  if (message.sender === "system") {
    return (
      <div className="self-center rounded-full bg-anchor/10 px-3 py-1 text-[10px] uppercase tracking-widest text-anchor/60">
        {message.content}
      </div>
    );
  }
  const mine = message.sender === "trainee";
  return (
    <div
      className={`relative max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card ${
        mine
          ? "self-end bg-anchor text-ivory bubble-tail-right"
          : "self-start bg-white text-anchor bubble-tail-left"
      }`}
    >
      <span className="whitespace-pre-wrap">{message.content}</span>
      <span
        className={`mt-1 block text-[10px] ${
          mine ? "text-ivory/60" : "text-anchor/40"
        }`}
      >
        {new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
