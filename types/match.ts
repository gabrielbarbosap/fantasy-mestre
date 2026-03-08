export type MatchStatus = "scheduled" | "live" | "finished";

export interface Match {
  matchId: string;
  opponent: string;
  date: string;
  status: MatchStatus;
}
