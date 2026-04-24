"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";
import { LuxuryButton } from "@/components/LuxuryButton";
import { Sidebar } from "@/components/Sidebar";
import { difficultyLabel, roleLabel } from "@/lib/format";
import type { AppUser, ChatMessage, Scenario, SimulationStatus } from "@/types/database";

const TONE_CUES = [
  { trigger: /\b(please please|pretty please)\b/i, note: "Guard against begging language." },
  { trigger: /!{2,}/, note: "Restraint — avoid exclamation stacking." },
  { trigger: /\b(lol|haha|omg|yay|btw)\b/i, note: "Casual slang detected — raise register." },
  { trigger: /\bdiscount\b|\bcheaper\b|\bfree\b/i, note: "Do not discount the experience." },
  { trigger: /\bsorry to bother\b|\bjust checking\b/i, note: "Non-desperate tone — re-frame." },
  { trigger: /\b(hun|babe|dear|sweetie)\b/i, note: "Use the patient's name, not endearments." },
];

export function SimulationRoom({
  user,
  simulationId,
  status,
  scenario,
  initialMessages,
}: {
  user: AppUser;
  simulationId: string;
  status: SimulationStatus;
  scenario: Scenario;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [aiTyping, setAiTyping] = useState(false);
  const [ending, setEnding] = useState(false);
  const [toneWarning, setToneWarning] = useState<string | null>(null);
  const [simStatus, setSimStatus] = useState<SimulationStatus>(status);

  const traineeCount = useMemo(
    () => messages.filter((m) => m.sender === "trainee").length,
    [messages],
  );
  const canEnd = traineeCount >= 1 && simStatus === "in_progress";

  async function sendMessage(msg: string) {
    // Tone cue check (client-side hint only)
    const cue = TONE_CUES.find((t) => t.trigger.test(msg));
    setToneWarning(cue?.note ?? null);

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      simulation_id: simulationId,
      sender: "trainee",
      message: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setAiTyping(true);

    try {
      const res = await fetch("/api/simulations/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_id: simulationId, user_message: msg }),
      });
      if (!res.ok) throw new Error("Message failed");
      const { message } = (await res.json()) as { message: ChatMessage };
      setMessages((prev) => [...prev, message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          simulation_id: simulationId,
          sender: "system",
          message: "Unable to reach the simulator. Try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setAiTyping(false);
    }
  }

  async function endSimulation() {
    if (!canEnd) return;
    setEnding(true);
    try {
      const res = await fetch("/api/simulations/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulation_id: simulationId }),
      });
      if (!res.ok) {
        setEnding(false);
        return;
      }
      setSimStatus("completed");
      router.push(`/results/${simulationId}`);
    } catch {
      setEnding(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 flex flex-col md:flex-row">
        {/* Chat column */}
        <section className="flex-1 min-w-0 flex flex-col border-r border-linen/60">
          <div className="px-6 py-4 bg-ivory-warm border-b border-linen/70 flex items-center justify-between">
            <div>
              <div className="text-[11px] tracking-luxe uppercase text-bronze">
                Private Consultation · Patient Simulation
              </div>
              <div className="font-display text-lg text-anchor mt-0.5">{scenario.title}</div>
            </div>
            <LuxuryButton
              variant="outline"
              size="sm"
              onClick={endSimulation}
              disabled={!canEnd || ending}
            >
              {ending ? "Evaluating…" : "End Simulation"}
            </LuxuryButton>
          </div>

          <ChatWindow messages={messages} aiTyping={aiTyping} />

          {simStatus === "in_progress" ? (
            <MessageInput onSend={sendMessage} disabled={aiTyping || ending} />
          ) : (
            <div className="border-t border-linen/70 bg-ivory-warm px-6 py-4 text-sm text-bronze">
              Simulation complete.{" "}
              <button
                onClick={() => router.push(`/results/${simulationId}`)}
                className="text-anchor underline underline-offset-2"
              >
                View results →
              </button>
            </div>
          )}
        </section>

        {/* Right sidebar */}
        <aside className="w-full md:w-80 bg-ivory-warm md:border-l border-linen/70 p-6 space-y-6">
          <div>
            <div className="text-[11px] tracking-luxe uppercase text-bronze">Scenario</div>
            <div className="font-display text-lg text-anchor mt-1 leading-snug">
              {scenario.title}
            </div>
            <div className="text-xs text-bronze mt-1">
              {scenario.category} · {difficultyLabel(scenario.difficulty)}
            </div>
            <div className="text-xs text-bronze/80 italic mt-0.5">
              Role: {roleLabel(scenario.role_target)}
            </div>
          </div>

          <div>
            <div className="text-[11px] tracking-luxe uppercase text-bronze mb-1">
              SOP Reminders
            </div>
            <ul className="text-xs text-anchor/80 space-y-1.5 list-disc pl-4">
              <li>Calm, brief, elegant. No chasing.</li>
              <li>$420 consultation · $100 reservation fee applied.</li>
              <li>Saturdays only, one patient per session, full hour.</li>
              <li>Preference questionnaire 48h before.</li>
              <li>Live location optional — never insist.</li>
            </ul>
            {scenario.sop_reference && (
              <div className="text-[10px] text-bronze/80 italic mt-2">
                Reference: {scenario.sop_reference}
              </div>
            )}
          </div>

          <div>
            <div className="text-[11px] tracking-luxe uppercase text-bronze mb-1">
              Live Tone Warning
            </div>
            <div className="text-xs text-anchor min-h-[1.5rem]">
              {toneWarning ? (
                <span className="text-[#7A2E2E]">{toneWarning}</span>
              ) : (
                <span className="text-bronze/70">Holding the standard.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-linen/70">
            <div className="text-[11px] tracking-luxe uppercase text-bronze mb-1">
              Hidden Evaluator
            </div>
            <div className="text-xs text-bronze/80">
              Scoring silently. You will see the full breakdown once you end the simulation.
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
