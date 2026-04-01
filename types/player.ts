export type PlayerPosition = "GK" | "DEF" | "MID" | "ATT";

export interface Player {
  playerId: string;
  name: string;
  position: PlayerPosition;
  number: number;
  active: boolean;
  photo?: string;
  clubId?: string;
}
