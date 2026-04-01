"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAllPlayers, sortPlayersByDisplayOrder } from "@/services/player.service";
import { useAuth } from "@/hooks/useAuth";
import { SCORING_RULES } from "@/types/database";
import { Shimmer } from "@/components/Shimmer";
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

  const sortedPlayers = sortPlayersByDisplayOrder(
    players.filter((p) => p.active !== false)
  );

  if (authLoading || isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <Shimmer className="h-12 w-72 rounded-xl" />
        <Shimmer className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden border-b border-blue-100 bg-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-28 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Bancada FC • Edição Santa Cruz
            </p>
            <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
              O fantasy dos torcedores do Santa Cruz
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Escale 5 jogadores, acompanhe a pontuação rodada a rodada e prove
              que você entende mais de futebol que sua galera.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Criar conta grátis
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Já tenho conta
              </Link>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Grátis para começar • Ranking em tempo real • Ligas privadas
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-xl shadow-blue-100/60">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ligas</p>
                <p className="mt-2 text-2xl font-black text-slate-900">Privadas</p>
                <p className="mt-1 text-sm text-slate-600">Torneios entre amigos e comunidades</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bônus</p>
                <p className="mt-2 text-2xl font-black text-slate-900">+{SCORING_RULES.correctScore}</p>
                <p className="mt-1 text-sm text-slate-600">Acertando o placar da partida</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-white p-4 shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Regra da escalação</p>
                <p className="mt-2 font-bold text-slate-900">5 jogadores obrigatórios</p>
                <p className="mt-1 text-sm text-slate-600">Com ao menos 1 da defesa (GK/DEF), 1 do meio e 1 do ataque.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-800">Disputa com amigos</p>
            <p className="mt-1 text-sm text-slate-600">Crie ligas privadas e desafie seu grupo.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-800">Ranking geral</p>
            <p className="mt-1 text-sm text-slate-600">Veja sua posição e suba a cada rodada.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-800">Pontuação clara</p>
            <p className="mt-1 text-sm text-slate-600">Regras simples para acompanhar sem complicação.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-800">Bônus de placar</p>
            <p className="mt-1 text-sm text-slate-600">Acertou o placar? Ganha pontos extras.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Como funciona</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Passo 1</p>
              <h3 className="mt-1 font-bold text-slate-900">Monte seu time</h3>
              <p className="mt-2 text-sm text-slate-600">Escolha 5 atletas respeitando as posições obrigatórias.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Passo 2</p>
              <h3 className="mt-1 font-bold text-slate-900">Acompanhe a rodada</h3>
              <p className="mt-2 text-sm text-slate-600">Pontuação baseada em estatísticas reais da partida.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Passo 3</p>
              <h3 className="mt-1 font-bold text-slate-900">Suba no ranking</h3>
              <p className="mt-2 text-sm text-slate-600">Dispute no ranking geral e em ligas privadas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-900">Esquema de pontuação</h2>
          <p className="mt-2 text-slate-600">Regras claras e simples para o torcedor.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Gol <strong>+{SCORING_RULES.goal}</strong></div>
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Assistência <strong>+{SCORING_RULES.assist}</strong></div>
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Acertar placar <strong>+{SCORING_RULES.correctScore}</strong></div>
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">90 minutos <strong>+{SCORING_RULES.play90Minutes}</strong></div>
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Clean sheet <strong>+{SCORING_RULES.cleanSheet}</strong></div>
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900">Cartão amarelo <strong>{SCORING_RULES.yellowCard}</strong></div>
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900">Gol sofrido (GOL/DEF) <strong>{SCORING_RULES.goalConceded}</strong></div>
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900">Cartão vermelho <strong>{SCORING_RULES.redCard}</strong></div>
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900">Pênalti perdido <strong>{SCORING_RULES.missedPenalty}</strong></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Preview do elenco</h2>
              <p className="mt-1 text-sm text-slate-600">Escolha seus atletas e monte a melhor escalação.</p>
            </div>
            <Link href="/register" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              Começar agora →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Shimmer key={item} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : sortedPlayers.length === 0 ? (
            <p className="py-6 text-center text-slate-500">Nenhum jogador cadastrado no momento.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sortedPlayers.slice(0, 12).map((p) => (
                <div key={p.playerId} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-blue-700">{POS[p.position] ?? p.position}</p>
                  <p className="mt-1 truncate font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">Camisa #{p.number}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
