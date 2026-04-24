"use client";

import { useEffect, useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";
import { EvaluationPanel } from "@/components/EvaluationPanel";

export default function SimulationPage({ params }: { params: { id: string } }) {
  const [simulationId, setSimulationId] = useState<string>("");
  const [messages, setMessages] = useState<{ sender: "ai_client" | "trainee"; message: string; timestamp: string }[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/simulations/start", {
        method: "POST",
        body: JSON.stringify({ user_id: "00000000-0000-0000-0000-000000000001", scenario_id: params.id })
      });
      const data = await res.json();
      setSimulationId(data.simulation_id);
      setMessages([{ sender: "ai_client", message: data.opening_message, timestamp: new Date().toISOString() }]);
    })();
  }, [params.id]);

  return (
    <main className="container">
      <h1>Live Simulation</h1>
      <div className="chat-shell">
        <div style={{ display: "grid", gap: ".75rem" }}>
          <ChatWindow messages={messages} />
          <MessageInput
            onSend={async (text) => {
              setMessages((prev) => [...prev, { sender: "trainee", message: text, timestamp: new Date().toISOString() }]);
              const res = await fetch("/api/simulations/message", {
                method: "POST",
                body: JSON.stringify({ simulation_id: simulationId, user_message: text })
              });
              const data = await res.json();
              setMessages((prev) => [...prev, { sender: "ai_client", message: data.reply, timestamp: new Date().toISOString() }]);
            }}
          />
          <button
            className="btn btn-gold"
            onClick={async () => {
              const res = await fetch("/api/simulations/end", {
                method: "POST",
                body: JSON.stringify({ simulation_id: simulationId })
              });
              const data = await res.json();
              window.location.href = `/results/${simulationId}?score=${data.evaluation.final_score}`;
            }}
          >
            End Simulation
          </button>
        </div>
        <EvaluationPanel
          scenarioTitle="Private Consultation Simulation"
          difficulty={3}
          role="whatsapp_agent"
          warnings={["Keep responses brief.", "Avoid pursuing non-response."]}
        />
      </div>
    </main>
  );
}
