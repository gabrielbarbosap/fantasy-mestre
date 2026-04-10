/** Escalação do usuário para uma partida específica */
export interface MatchLineup {
  matchId: string;
  userId: string;
  players: Record<string, boolean>;
  /** Palpite do placar: gols do Santa Cruz (mandante) */
  placarCasa?: number;
  /** Palpite do placar: gols do adversário */
  placarVisitante?: number;
  createdAt: string;
}
