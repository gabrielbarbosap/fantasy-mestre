import type { LeaderboardEntry } from "@/types/database";

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/ranking", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar ranking");
  }
  return res.json();
}
