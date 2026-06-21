import { create } from 'zustand';
import type { Match } from '../types';
import { getMatches } from '../api/social';
import { onNewMatch } from '../api/socket';

interface MatchState {
  matches: Match[];
  loading: boolean;
  error: string | null;
  // The most recent match (used to show the "It's a match!" banner).
  lastMatch: Match | null;
  socketBound: boolean;

  loadMatches: (eventId: string) => Promise<void>;
  addMatch: (match: Match) => void;
  clearLastMatch: () => void;
  // Begin listening to socket new_match events. Returns an unsubscribe fn.
  bindSocket: () => () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,
  lastMatch: null,
  socketBound: false,

  loadMatches: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const matches = await getMatches(eventId);
      set({ matches, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error)?.message ?? 'Failed to load matches' });
    }
  },

  addMatch: (match) =>
    set((s) => {
      const exists = s.matches.some((m) => m.id === match.id);
      return {
        matches: exists ? s.matches : [match, ...s.matches],
        lastMatch: match,
      };
    }),

  clearLastMatch: () => set({ lastMatch: null }),

  bindSocket: () => {
    // Avoid double-binding the listener.
    if (get().socketBound) return () => undefined;
    set({ socketBound: true });
    const unsub = onNewMatch((match) => {
      get().addMatch(match);
    });
    return () => {
      unsub();
      set({ socketBound: false });
    };
  },
}));
