// Shared domain + navigation types for the Prelude mobile app.
// API shapes are kept loose (most fields optional) because the backend is
// developed separately; screens use optional chaining + defensive defaults.

export interface User {
  id: string;
  name?: string;
  phone?: string;
  age?: number;
  interests?: string[];
}

export interface PreludeEvent {
  id: string;
  name?: string;
  description?: string;
  venue?: string;
  start_time?: string;
  end_time?: string;
  capacity?: number;
  ticket_price?: number;
  vibe_tags?: string[];
  attendees_count?: number;
}

export interface Attendee {
  user_id: string;
  name?: string;
  age?: number;
  interests?: string[];
}

// A candidate surfaced in the swipe feed.
export interface FeedUser {
  user_id: string;
  name?: string;
  age?: number;
  interests?: string[];
  score?: number;
}

export interface FeedResponse {
  users?: FeedUser[];
}

export interface Match {
  id: string;
  user_a?: string;
  user_b?: string;
  chat_id?: string;
  event_id?: string;
  // Optional denormalized peer info if the backend provides it.
  name?: string;
}

export interface Ticket {
  id?: string;
  event_id?: string;
  user_id?: string;
  status?: string;
}

export interface ChatMessage {
  id?: string;
  chat_id?: string;
  event_id?: string;
  sender_id?: string;
  text?: string;
  created_at?: string;
}

// Result of a swipe action against the social API.
export interface SwipeResult {
  matched?: boolean;
  match?: Match;
}

export type SwipeDirection = 'like' | 'pass' | 'superlike';

// React Navigation param list (native-stack).
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Events: undefined;
  EventDetail: { eventId: string };
  Ticket: { eventId: string };
  Swipe: { eventId: string };
  Matches: { eventId: string };
  Chat: { eventId: string; chatId: string; peerName?: string };
};
