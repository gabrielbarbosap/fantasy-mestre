"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayerCard } from "@/components/PlayerCard";
import { fetchAllPlayers } from "@/services/player.service";
import type { Player } from "@/types/player";

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPlayers()
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Elenco</h1>
          <p className="text-blue-700">
            Jogadores disponíveis para montar seu time
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-50"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Criar conta
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="text-blue-600">Carregando jogadores...</span>
        </div>
      ) : players.length === 0 ? (
        <p className="py-16 text-center text-blue-600">
          Nenhum jogador cadastrado. Execute <code className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">npm run seed</code> para popular o banco.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {players
            .filter((p) => p.active !== false)
            .sort((a, b) => {
              const order = { GK: 0, DEF: 1, MID: 2, ATT: 3 };
              return (order[a.position] ?? 4) - (order[b.position] ?? 4) || a.number - b.number;
            })
            .map((player) => (
              <PlayerCard key={player.playerId} player={player} displayOnly />
            ))}
        </div>
      )}
    </div>
  );
}
