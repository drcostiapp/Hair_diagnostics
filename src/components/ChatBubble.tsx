import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/format";
import type { MessageSender } from "@/types/database";

export function ChatBubble({
  sender,
  message,
  timestamp,
}: {
  sender: MessageSender;
  message: string;
  timestamp: string;
}) {
  const mine = sender === "trainee";
  const system = sender === "system";

  if (system) {
    return (
      <div className="text-center my-3">
        <span className="inline-block text-[11px] tracking-luxe uppercase text-bronze bg-linen/50 px-3 py-1 rounded-full">
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex mb-2", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap",
          mine
            ? "bg-anchor text-ivory rounded-br-sm shadow-quiet"
            : "bg-white text-anchor rounded-bl-sm border border-linen/80 shadow-quiet",
        )}
      >
        {message}
        <div
          className={cn(
            "text-[10px] mt-1 text-right tracking-wide",
            mine ? "text-ivory/60" : "text-bronze/70",
          )}
        >
          {formatClock(timestamp)}
        </div>
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-white border border-linen/80 rounded-2xl rounded-bl-sm px-4 py-3 shadow-quiet">
        <span className="dot-pulse">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}
