/** Escalação do usuário para uma partida específica */
export interface MatchLineup {
  matchId: string;
  userId: string;
  players: Record<string, boolean>;
  createdAt: string;
}
