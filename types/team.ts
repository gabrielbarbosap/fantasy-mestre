// Record<playerId, true> - denormalizado para leitura rápida
export interface Team {
  teamId: string;
  userId: string;
  players: Record<string, boolean>;
  createdAt: string;
}
