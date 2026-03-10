import type { LeaderboardEntry } from "@/types/database";

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/ranking");
  if (!res.ok) {
    throw new Error("Erro ao carregar ranking");
  }
  return res.json();
}
