export function ChatBubble({
  side,
  message,
  timestamp
}: {
  side: "ai_client" | "trainee";
  message: string;
  timestamp: string;
}) {
  return (
    <div className={`bubble ${side === "ai_client" ? "ai" : "trainee"}`}>
      <div>{message}</div>
      <div className="timestamp">{new Date(timestamp).toLocaleTimeString()}</div>
    </div>
  );
}
