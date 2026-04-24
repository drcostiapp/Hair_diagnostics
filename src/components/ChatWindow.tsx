"use client";

import { useEffect, useRef } from "react";
import { ChatBubble, TypingBubble } from "./ChatBubble";
import type { ChatMessage } from "@/types/database";

export function ChatWindow({
  messages,
  aiTyping,
}: {
  messages: ChatMessage[];
  aiTyping?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, aiTyping]);

  return (
    <div className="flex-1 overflow-y-auto luxe-scroll px-5 py-6 bg-ivory-warm">
      {messages.map((m) => (
        <ChatBubble
          key={m.id}
          sender={m.sender}
          message={m.message}
          timestamp={m.created_at}
        />
      ))}
      {aiTyping && <TypingBubble />}
      <div ref={bottomRef} />
    </div>
  );
}
