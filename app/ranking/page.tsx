"use client";

import { useEffect, useState } from "react";
import { RankingTable } from "@/components/RankingTable";
import { fetchLeaderboard } from "@/services/ranking.service";
import type { LeaderboardEntry } from "@/types/database";

export default function RankingPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-blue-900">Ranking</h1>
      <RankingTable entries={entries} loading={loading} />
    </div>
  );
}
