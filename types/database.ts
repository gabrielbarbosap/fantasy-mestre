export interface PlayerMatchStats {
  matchId: string;
  playerId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  /** Gol sofrido (afeta GK e DEF) */
  goalsConceded: number;
  /** Gol contra */
  ownGoals: number;
  /** Pênalti perdido */
  missedPenalties: number;
}

/** Regras de pontuação */
export const SCORING_RULES = {
  goal: 10,
  assist: 5,
  yellowCard: -2,
  redCard: -5,
  cleanSheet: 4, // GK e DEF, sem sofrer gol
  play90Minutes: 2,
  goalConceded: -1, // GK e DEF
  ownGoal: -6,
  missedPenalty: -4,
} as const;

// match_points: { matchId: { playerId: number } }
export type MatchPoints = Record<string, Record<string, number>>;

// user_match_points: { userId: { matchId: number } }
export type UserMatchPoints = Record<string, Record<string, number>>;

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  teamName: string;
  photoURL?: string;
}
