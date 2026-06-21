import { apiClient } from './client';
import type { Ticket, Attendee } from '../types';

// Mock-purchase a ticket for an event. Unlocks the attendee list on success.
export async function purchaseTicket(eventId: string): Promise<Ticket> {
  const { data } = await apiClient.post<{ ticket?: Ticket } | Ticket>(
    `/events/${eventId}/tickets`,
    { mock_payment: true },
  );
  const maybe = data as { ticket?: Ticket };
  return maybe?.ticket ?? (data as Ticket) ?? { event_id: eventId, status: 'active' };
}

// Get the unlocked attendee list for an event (requires a valid ticket).
export async function getAttendees(eventId: string): Promise<Attendee[]> {
  const { data } = await apiClient.get<{ attendees?: Attendee[] } | Attendee[]>(
    `/events/${eventId}/attendees`,
  );
  if (Array.isArray(data)) return data;
  return data?.attendees ?? [];
}
