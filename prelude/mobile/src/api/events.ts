import { apiClient } from './client';
import type { PreludeEvent } from '../types';

// List discoverable events.
export async function getEvents(): Promise<PreludeEvent[]> {
  const { data } = await apiClient.get<{ events?: PreludeEvent[] } | PreludeEvent[]>('/events');
  if (Array.isArray(data)) return data;
  return data?.events ?? [];
}

// Fetch a single event by id.
export async function getEvent(eventId: string): Promise<PreludeEvent | null> {
  const { data } = await apiClient.get<{ event?: PreludeEvent } | PreludeEvent>(
    `/events/${eventId}`,
  );
  const maybe = data as { event?: PreludeEvent };
  return maybe?.event ?? (data as PreludeEvent) ?? null;
}
