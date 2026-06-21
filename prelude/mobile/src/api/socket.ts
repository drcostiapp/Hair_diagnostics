import { io, Socket } from 'socket.io-client';
import type { ChatMessage, Match } from '../types';
import { useUserStore } from '../store/useUserStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

// Lazily create (and reuse) a single socket connection, authenticated with the JWT.
export function getSocket(): Socket {
  if (socket) return socket;
  const token = useUserStore.getState().token;
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
    auth: token ? { token } : undefined,
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

// Join an event-scoped room. Chat is time-bound to the event.
export function joinEvent(eventId: string): void {
  getSocket().emit('join_event', { event_id: eventId });
}

export function leaveEvent(eventId: string): void {
  socket?.emit('leave_event', { event_id: eventId });
}

export interface SendMessagePayload {
  eventId: string;
  chatId: string;
  text: string;
}

export function sendMessage({ eventId, chatId, text }: SendMessagePayload): void {
  getSocket().emit('send_message', {
    event_id: eventId,
    chat_id: chatId,
    text,
  });
}

// Subscribe to incoming chat messages. Returns an unsubscribe function.
export function onNewMessage(handler: (msg: ChatMessage) => void): () => void {
  const s = getSocket();
  s.on('new_message', handler);
  return () => s.off('new_message', handler);
}

// Subscribe to new match events. Returns an unsubscribe function.
export function onNewMatch(handler: (match: Match) => void): () => void {
  const s = getSocket();
  s.on('new_match', handler);
  return () => s.off('new_match', handler);
}

export { SOCKET_URL };
