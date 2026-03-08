"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PlayerCard } from "@/components/PlayerCard";
import { fetchLineup } from "@/services/lineup.service";
import { fetchAllPlayers } from "@/services/player.service";
import { fetchNextUpcomingMatch } from "@/services/match.service";
import { HOME_TEAM } from "@/services/match.service";
import type { Player } from "@/types/player";
import type { Match } from "@/types/match";

const ZONE_ORDER = { GK: 0, DEF: 1, MID: 2, ATT: 3 };

export default function MeuTimePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.uid) return;

    fetchNextUpcomingMatch().then(async (nextMatch) => {
      setMatch(nextMatch ?? null);
      if (!nextMatch) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      const [lineup, allPlayers] = await Promise.all([
        fetchLineup(nextMatch.matchId, user.uid),
        fetchAllPlayers(),
      ]);

      const selectedIds = lineup?.players ? Object.keys(lineup.players) : [];
      const selected = allPlayers.filter((p) =>
        selectedIds.includes(p.playerId)
      );
      selected.sort(
        (a, b) =>
          (ZONE_ORDER[a.position] ?? 4) - (ZONE_ORDER[b.position] ?? 4) ||
          a.number - b.number
      );
      setPlayers(selected);
    }).finally(() => setLoading(false));
  }, [user?.uid]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Meu Time</h1>
          <p className="text-blue-700">
            {match
              ? `Escalação para ${HOME_TEAM} x ${match.opponent}`
              : "Selecione uma partida para ver sua escalação"}
          </p>
        </div>
        <Link
          href="/team"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Editar time
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="text-blue-600">Carregando...</span>
        </div>
      ) : !match ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-12 text-center">
          <p className="mb-4 text-blue-700">
            Nenhuma partida agendada. Sua escalação aparecerá aqui quando houver uma partida.
          </p>
          <Link
            href="/team"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Montar time
          </Link>
        </div>
      ) : players.length === 0 ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-12 text-center">
          <p className="mb-4 text-blue-700">
            Você ainda não selecionou seus 5 jogadores para esta partida.
          </p>
          <Link
            href="/team"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Montar time
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {players.map((player) => (
            <PlayerCard key={player.playerId} player={player} displayOnly />
          ))}
        </div>
      )}
    </div>
  );
}
