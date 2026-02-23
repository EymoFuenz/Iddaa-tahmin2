// Recent Match Info
export interface RecentMatch {
  date: string;
  opponent: string;
  result: 'W' | 'D' | 'L';
  score: string; // e.g., "2-1"
  homeAway: 'H' | 'A';
}

// Team Types
export interface Team {
  id: number;
  name: string;
  logo: string;
  code: string;
  founded: number;
  country: string;
  marketValue?: number;
  recentMatches?: RecentMatch[];
  createdAt?: string;
  updatedAt?: string;
}

// Match Types
export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  status: 'scheduled' | 'live' | 'finished';
  homeGoals: number;
  awayGoals: number;
  league: string;
  season: number;
  round: number;
  venue: string;
}

// Sezon verisi (Firebase seasonData) – yıl bazlı takım + maç listesi
export interface SeasonData {
  season: number;
  leagueId: number;
  teams: Team[];
  matches: Match[];
  fetchedAt: string; // ISO string
}

// Takım sezon verisi (Firebase teamSeasonData) – takım + o sezondaki maçları
export interface TeamSeasonData {
  season: number;
  teamId: number;
  team: Team;
  matches: Match[];
  fetchedAt: string;
}

// Team Statistics
export interface TeamStats {
  teamId: number;
  teamName: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

// Form Data
export interface TeamFormData {
  teamId: number;
  lastMatches: Match[];
  homeForm: Match[];
  awayForm: Match[];
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  shotsOnTarget: number;
  possession: number;
  corners: number;
}

// Form Rating
export interface FormRating {
  teamId: number;
  teamName: string;
  formIndex: number; // 0-100
  attackStrength: number; // 0-100
  defenseRating: number; // 0-100
  momentum: number; // -100 to 100 (trend from last 5 games)
  homeAdvantage: number; // 0-20
  winProbability: number; // 0-100
  form: string; // "WWDLW" style
}

// Prediction
export interface BettingOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over05: number;
  over15: number;
  over25: number;
  over35: number;
  btts: number;
  bttsAndOver25: number;
}

export interface BettingProbabilities {
  homeWin: number;
  draw: number;
  awayWin: number;
  over05: number;
  over15: number;
  over25: number;
  over35: number;
  btts: number;
  bttsAndOver25: number;
  bothTeamsWin: number;
  over1Under3: number;
}

export interface MatchPrediction {
  matchId?: number;
  match: string;
  homeTeam: string;
  awayTeam: string;
  predictedResult: 'Home Win' | 'Draw' | 'Away Win';
  confidence: number; // 0-100
  over25Probability: number; // 0-100
  btts: boolean; // Both Teams To Score
  bttsProbability: number; // 0-100
  predictedScore: string; // e.g., "2-1"
  homeWinOdds: number;
  drawOdds: number;
  awayWinOdds: number;
  bettingOdds: BettingOdds;
  bettingProbabilities: BettingProbabilities;
  analysisText: string;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number; // positive or negative
  description: string;
}

// Historical Data
export interface PredictionHistory {
  id: string;
  prediction: MatchPrediction;
  actualResult?: string;
  actualScore?: string;
  isCorrect?: boolean;
  roi?: number; // Return on Investment
  timestamp: string;
}

// API Types
export interface FootballAPITeam {
  team: {
    id: number;
    name: string;
    logo: string;
    code?: string;
    founded?: number;
    country?: string;
  };
  venue?: {
    name: string;
  };
}

export interface FootballAPIMatch {
  fixture: {
    id: number;
    date: string;
    status: string;
  };
  league: {
    season: number;
    round?: string;
    name?: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; country?: string };
    away: { id: number; name: string; logo: string; country?: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  venue?: { name?: string };
}

export interface FootballAPIStats {
  statistics: Array<{
    type: string;
    value: number | string;
  }>;
}

// Store Types for Zustand
export interface AppStore {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  currentMatch: Match | null;
  setCurrentMatch: (match: Match | null) => void;
  predictions: MatchPrediction[];
  setPredictions: (predictions: MatchPrediction[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}
