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
      {/* Hero - conteúdo estático para SEO e AdSense */}
      <section className="mb-10 rounded-xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-blue-900 sm:text-3xl">
          Fantasy Club — Monte seu time e dispute o ranking
        </h1>
        <p className="mt-3 max-w-2xl text-blue-800">
          Fantasy Club é um jogo de futebol virtual onde você monta seu time com jogadores reais, 
          acumula pontos com base nas estatísticas das partidas e compete com outros participantes no ranking. 
          Crie sua conta, escolha seu elenco e acompanhe os resultados.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
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
      </section>

      {/* Como funciona - conteúdo valioso estático */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-blue-900">Como funciona</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-blue-100 bg-white p-4">
            <h3 className="font-semibold text-blue-800">1. Monte seu time</h3>
            <p className="mt-1 text-sm text-blue-700">
              Escolha os jogadores do elenco disponível, respeitando a formação (goleiro, defensores, meias e atacantes).
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4">
            <h3 className="font-semibold text-blue-800">2. Acompanhe as partidas</h3>
            <p className="mt-1 text-sm text-blue-700">
              Seus jogadores pontuam com gols, assistências, minutos em campo e outras estatísticas nas partidas reais.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4 sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-blue-800">3. Suba no ranking</h3>
            <p className="mt-1 text-sm text-blue-700">
              Compita com outros participantes no ranking geral e, se for premium, em ligas exclusivas.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Elenco</h2>
          <p className="text-blue-700">
            Jogadores disponíveis para montar seu time
          </p>
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
