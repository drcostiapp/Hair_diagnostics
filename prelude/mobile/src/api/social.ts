import { apiClient } from './client';
import type { FeedUser, FeedResponse, Match, SwipeResult } from '../types';

// Fetch the swipe feed for an event.
export async function getFeed(eventId: string): Promise<FeedUser[]> {
  const { data } = await apiClient.get<FeedResponse | FeedUser[]>(
    `/events/${eventId}/feed`,
  );
  if (Array.isArray(data)) return data;
  return data?.users ?? [];
}

async function swipe(
  eventId: string,
  targetUserId: string,
  action: 'like' | 'pass' | 'superlike',
): Promise<SwipeResult> {
  const { data } = await apiClient.post<SwipeResult>(
    `/events/${eventId}/swipe`,
    { target_user_id: targetUserId, action },
  );
  return data ?? {};
}

export function like(eventId: string, targetUserId: string): Promise<SwipeResult> {
  return swipe(eventId, targetUserId, 'like');
}

export function pass(eventId: string, targetUserId: string): Promise<SwipeResult> {
  return swipe(eventId, targetUserId, 'pass');
}

export function superlike(eventId: string, targetUserId: string): Promise<SwipeResult> {
  return swipe(eventId, targetUserId, 'superlike');
}

// Fetch matches for an event.
export async function getMatches(eventId: string): Promise<Match[]> {
  const { data } = await apiClient.get<{ matches?: Match[] } | Match[]>(
    `/events/${eventId}/matches`,
  );
  if (Array.isArray(data)) return data;
  return data?.matches ?? [];
}
