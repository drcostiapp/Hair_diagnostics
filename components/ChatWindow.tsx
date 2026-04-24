import { ChatBubble } from "@/components/ChatBubble";

export function ChatWindow({
  messages
}: {
  messages: { sender: "ai_client" | "trainee"; message: string; timestamp: string }[];
}) {
  return (
    <section className="chat-window">
      {messages.map((msg, idx) => (
        <ChatBubble key={idx} side={msg.sender} message={msg.message} timestamp={msg.timestamp} />
      ))}
    </section>
  );
}
