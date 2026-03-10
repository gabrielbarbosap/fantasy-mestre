/** Escalação do usuário para uma partida específica */
export interface MatchLineup {
  matchId: string;
  userId: string;
  players: Record<string, boolean>;
  /** Palpite do placar: gols do time da casa (Santa Cruz) */
  placarCasa?: number;
  /** Palpite do placar: gols do visitante */
  placarVisitante?: number;
  createdAt: string;
}
