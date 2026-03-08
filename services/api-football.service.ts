/**
 * Serviço para buscar jogadores na API-Football
 * Documentação: https://www.api-football.com/documentation-v3
 */

import type { Player } from "@/types/player";

const API_BASE = "https://v3.football.api-sports.io";

interface ApiFootballPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}

interface ApiFootballResponse {
  response: Array<{
    team: { id: number; name: string; logo: string };
    players: ApiFootballPlayer[];
  }>;
}

const POSITION_MAP: Record<string, Player["position"]> = {
  Goalkeeper: "GK",
  Defender: "DEF",
  Midfielder: "MID",
  Attacker: "ATT",
};

function mapPosition(apiPosition: string): Player["position"] {
  return POSITION_MAP[apiPosition] ?? "MID";
}

export async function fetchSquad(teamId: string): Promise<Player[]> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new Error("API_FOOTBALL_KEY não configurada no .env.local");
  }

  const res = await fetch(`${API_BASE}/players/squads?team=${teamId}`, {
    headers: { "x-apisports-key": key },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API-Football erro ${res.status}: ${text}`);
  }

  const data = (await res.json()) as ApiFootballResponse;
  const squad = data.response?.[0];
  if (!squad?.players?.length) return [];

  const players: Player[] = squad.players.map((p) => ({
    playerId: String(p.id),
    name: p.name,
    position: mapPosition(p.position),
    number: p.number ?? 0,
    price: 5_000_000,
    active: true,
    photo: p.photo,
  }));

  return players;
}
