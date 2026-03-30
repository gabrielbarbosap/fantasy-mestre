"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAllPlayers } from "@/services/player.service";
import { useAuth } from "@/hooks/useAuth";
import { SCORING_RULES } from "@/types/database";
import { Shimmer, TableShimmer } from "@/components/Shimmer";
import type { Player } from "@/types/player";

const POS: Record<string, string> = { GK: "GOL", DEF: "DEF", MID: "MID", ATT: "ATA" };

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) return;
    fetchAllPlayers()
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const sortedPlayers = [...players]
    .filter((p) => p.active !== false)
    .sort((a, b) => {
      const order = { GK: 0, DEF: 1, MID: 2, ATT: 3 };
      return (order[a.position] ?? 4) - (order[b.position] ?? 4) || a.number - b.number;
    });

  if (authLoading || isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <Shimmer className="h-10 w-64 rounded-lg" />
        <TableShimmer rows={10} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero - O que é o Fantasy Club */}
      {!isAuthenticated && (
        <section className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-blue-900 sm:text-4xl">
            Fantasy Club
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-800">
            Monte seu time com jogadores reais, acompanhe as partidas e dispute o ranking com seus amigos. 
            O jogo mais simples e divertido de futebol virtual.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Começar grátis
            </Link>
            <Link
              href="/login"
              className="rounded-xl border-2 border-blue-600 px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Já tenho conta
            </Link>
          </div>
        </section>
      )}

      {/* Jogue com os amigos */}
      {!isAuthenticated && (
        <section className="mb-12 rounded-2xl bg-blue-50 p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-bold text-blue-900 sm:text-2xl">
            Jogue com os amigos
          </h2>
          <p className="mb-6 text-blue-800">
            Crie ou entre em ligas privadas e dispute apenas com quem você conhece. 
            Combine uma liga entre colegas de trabalho, turma da faculdade ou grupo de amigos — 
            e veja quem monta o melhor time.
          </p>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">🏆</span>
              <span><strong>Ranking geral</strong> — Compita com todos os participantes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">👥</span>
              <span><strong>Ligas privadas</strong> — Crie grupos exclusivos com código</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">📊</span>
              <span><strong>Pontos em tempo real</strong> — Acompanhe as estatísticas das partidas</span>
            </li>
          </ul>
        </section>
      )}

      {/* Esquema de pontuação */}
      {!isAuthenticated && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-blue-900 sm:text-2xl">
            Esquema de pontuação
          </h2>
          <p className="mb-4 text-blue-700">
            Seus jogadores somam ou perdem pontos conforme as estatísticas nas partidas reais:
          </p>
          <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200 bg-blue-50">
                  <th className="px-4 py-3 text-left font-semibold text-blue-900">Evento</th>
                  <th className="px-4 py-3 text-right font-semibold text-blue-900">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                <tr><td className="px-4 py-2.5 text-blue-800">Gol</td><td className="px-4 py-2.5 text-right font-medium text-green-600">+{SCORING_RULES.goal}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Assistência</td><td className="px-4 py-2.5 text-right font-medium text-green-600">+{SCORING_RULES.assist}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Acertar o placar</td><td className="px-4 py-2.5 text-right font-medium text-green-600">+{SCORING_RULES.correctScore}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Jogou 90 minutos</td><td className="px-4 py-2.5 text-right font-medium text-green-600">+{SCORING_RULES.play90Minutes}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Clean sheet (GOL/DEF, 60+ min sem gol sofrido)</td><td className="px-4 py-2.5 text-right font-medium text-green-600">+{SCORING_RULES.cleanSheet}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Cartão amarelo</td><td className="px-4 py-2.5 text-right font-medium text-red-600">{SCORING_RULES.yellowCard}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Gol sofrido (GOL/DEF)</td><td className="px-4 py-2.5 text-right font-medium text-red-600">{SCORING_RULES.goalConceded}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Cartão vermelho</td><td className="px-4 py-2.5 text-right font-medium text-red-600">{SCORING_RULES.redCard}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Pênalti perdido</td><td className="px-4 py-2.5 text-right font-medium text-red-600">{SCORING_RULES.missedPenalty}</td></tr>
                <tr><td className="px-4 py-2.5 text-blue-800">Gol contra</td><td className="px-4 py-2.5 text-right font-medium text-red-600">{SCORING_RULES.ownGoal}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Como funciona */}
      {!isAuthenticated && (
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-blue-900 sm:text-2xl">
            Como funciona
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-white p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">1</div>
              <h3 className="font-semibold text-blue-900">Monte seu time</h3>
              <p className="mt-2 text-sm text-blue-700">
                Escolha goleiro, defensores, meias e atacantes do elenco disponível.
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">2</div>
              <h3 className="font-semibold text-blue-900">Acompanhe as partidas</h3>
              <p className="mt-2 text-sm text-blue-700">
                Seus jogadores pontuam com base nas estatísticas reais dos jogos.
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-white p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">3</div>
              <h3 className="font-semibold text-blue-900">Suba no ranking</h3>
              <p className="mt-2 text-sm text-blue-700">
                Compita no ranking geral ou em ligas privadas com amigos.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Elenco - lista simplificada */}
      <section>
        <h2 className="mb-2 text-lg font-bold text-blue-900">
          Elenco
        </h2>
        <p className="mb-4 text-sm text-blue-700">
          Jogadores disponíveis para montar seu time
        </p>

        {loading ? (
          <TableShimmer rows={12} />
        ) : sortedPlayers.length === 0 ? (
          <p className="py-8 text-center text-blue-600">
            Nenhum jogador cadastrado no momento.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-blue-100 bg-blue-50/50">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-blue-600">Pos</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-blue-600">Nº</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-blue-600">Nome</th>
                  <th className="hidden px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-blue-600 sm:table-cell">Preço</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p) => (
                  <tr key={p.playerId} className="border-b border-blue-50 last:border-0">
                    <td className="px-3 py-2 font-medium text-blue-800">{POS[p.position] ?? p.position}</td>
                    <td className="px-3 py-2 text-blue-700">{p.number}</td>
                    <td className="truncate px-3 py-2 text-blue-900 max-w-[140px] sm:max-w-[200px]">{p.name}</td>
                    <td className="hidden px-3 py-2 text-right text-blue-700 sm:table-cell">
                      R$ {p.price.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
