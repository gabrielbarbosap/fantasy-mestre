export interface Club {
  id: string;
  name: string;
  apiTeamId: string; // ID na API-Football
}

export const CLUBS: Club[] = [
  { id: "santa-cruz", name: "Santa Cruz", apiTeamId: "753" },
];
