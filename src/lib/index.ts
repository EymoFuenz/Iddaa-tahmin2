/**
 * Global Application Store
 * Zustand store for state management
 */

import { create } from 'zustand';
import { Team, Match, MatchPrediction, AppStore } from '@/types';

export const useAppStore = create<AppStore>((set) => ({
  teams: [],
  setTeams: (teams: Team[]) => set({ teams }),

  currentMatch: null,
  setCurrentMatch: (match: Match | null) => set({ currentMatch: match }),

  predictions: [],
  setPredictions: (predictions: MatchPrediction[]) => set({ predictions }),

  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
}));
