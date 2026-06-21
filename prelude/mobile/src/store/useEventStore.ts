import { create } from 'zustand';
import type { PreludeEvent } from '../types';
import { getEvents, getEvent } from '../api/events';

interface EventState {
  events: PreludeEvent[];
  selectedEvent: PreludeEvent | null;
  loading: boolean;
  error: string | null;
  // Set of event ids the user has unlocked (purchased a ticket for).
  unlockedEventIds: Record<string, boolean>;

  loadEvents: () => Promise<void>;
  loadEvent: (eventId: string) => Promise<void>;
  selectEvent: (event: PreludeEvent | null) => void;
  markUnlocked: (eventId: string) => void;
  isUnlocked: (eventId: string) => boolean;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  unlockedEventIds: {},

  loadEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await getEvents();
      set({ events, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error)?.message ?? 'Failed to load events' });
    }
  },

  loadEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const event = await getEvent(eventId);
      set({ selectedEvent: event, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error)?.message ?? 'Failed to load event' });
    }
  },

  selectEvent: (event) => set({ selectedEvent: event }),

  markUnlocked: (eventId) =>
    set((s) => ({ unlockedEventIds: { ...s.unlockedEventIds, [eventId]: true } })),

  isUnlocked: (eventId) => !!get().unlockedEventIds[eventId],
}));
