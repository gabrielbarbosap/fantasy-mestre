"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { fetchUserPoints } from "@/services/user-points.service";
import { HOME_TEAM } from "@/services/match.service";
import { SCORING_RULES } from "@/types/database";
import { DashboardShimmer } from "@/components/Shimmer";

const POS: Record<string, string> = { GK: "GOL", DEF: "DEF", MID: "MID", ATT: "ATA" };

interface TopPickedPlayer {
  playerId: string;
  name: string;
  position: string;
  number: number;
  count: number;
}

interface MostPickedData {
  match: { matchId: string; opponent: string; date: string } | null;
  topPicked: TopPickedPlayer[];
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { profile, clubId } = useUserProfile();
  const router = useRouter();
  const [points, setPoints] = useState<{
    totalPoints: number;
    pointsByMatch: Array<{ matchId: string; opponent: string; date: string; points: number }>;
  } | null>(null);
  const [mostPicked, setMostPicked] = useState<MostPickedData | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchUserPoints(user.uid).then(setPoints);
  }, [user?.uid]);

  useEffect(() => {
    fetch(`/api/most-picked?clubId=${clubId ?? ""}`)
      .then((res) => res.json())
      .then((data: MostPickedData) => setMostPicked(data))
      .catch(() => setMostPicked(null));
  }, [clubId]);

  if (loading) {
    return <DashboardShimmer />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-blue-200 bg-blue-50">
          {profile?.photoURL ? (
            <Image
              src={profile.photoURL}
              alt={profile.name}
              fill
              className="object-cover"
              unoptimized
              sizes="56px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-blue-600">
              {profile?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-blue-900 sm:text-2xl">
          Olá, {profile?.name ?? user?.email?.split("@")[0]}!
        </h1>
      </div>
      <p className="mb-8 text-blue-700">
        Bem-vindo ao Bancada FC, a edição para torcedores do Santa Cruz. Monte seu time e dispute o ranking.
      </p>

      {mostPicked?.match && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-blue-900">
            Rodada aberta — {HOME_TEAM} x {mostPicked.match.opponent}
          </h2>
          <p className="mb-4 text-sm text-blue-600">
            {new Date(mostPicked.match.date).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {mostPicked.topPicked.length > 0 ? (
            <>
              <p className="mb-3 text-sm font-medium text-blue-700">
                Top 3 mais escalados
              </p>
              <div className="space-y-2">
                {mostPicked.topPicked.map((p, i) => (
                  <div
                    key={p.playerId}
                    className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-bold text-blue-800">
                        {i + 1}
                      </span>
                      <span className="font-medium text-blue-900">
                        {p.name}
                      </span>
                      <span className="text-sm text-blue-600">
                        {POS[p.position] ?? p.position} #{p.number}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-700">
                      {p.count} {p.count === 1 ? "escalação" : "escalações"}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/team"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Montar meu time →
              </Link>
            </>
          ) : (
            <p className="text-sm text-blue-600">
              Nenhuma escalação registrada ainda. Seja o primeiro a montar seu time!
            </p>
          )}
        </div>
      )}

      {points && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">
            Minha pontuação
          </h2>
          <p className="mb-4 text-3xl font-bold text-blue-900">
            {points.totalPoints} <span className="text-lg font-normal text-yellow-600">pts</span>
          </p>
          {points.pointsByMatch.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">
                Por partida
              </p>
              <div className="space-y-2">
                {points.pointsByMatch.map((m) => (
                  <Link
                    key={m.matchId}
                    href={`/partida/${m.matchId}`}
                    className="flex justify-between rounded-lg bg-blue-50 px-4 py-2 text-sm transition-colors hover:bg-blue-100"
                  >
                    <span className="text-blue-800">
                      {HOME_TEAM} x {m.opponent}
                    </span>
                    <span className="font-medium text-blue-900">
                      {m.points} pts
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-blue-600">
              Nenhuma partida com pontos lançados ainda.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <Link
          href="/meu-time"
          className="flex flex-col rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold text-blue-900">
            Meu Time
          </h2>
          <p className="text-sm text-blue-700">
            Veja os 5 jogadores da sua escalação.
          </p>
        </Link>
        <Link
          href="/team"
          className="flex flex-col rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold text-blue-900">
            Montar time
          </h2>
          <p className="text-sm text-blue-700">
            Escolha ou altere seus 5 jogadores.
          </p>
        </Link>
        <Link
          href="/perfil"
          className="flex flex-col rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold text-blue-900">Perfil</h2>
          <p className="text-sm text-blue-700">
            Clube e dados da conta.
          </p>
        </Link>
        <Link
          href="/ranking"
          className="flex flex-col rounded-xl border border-blue-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold text-blue-900">Ranking</h2>
          <p className="text-sm text-blue-700">
            Veja a classificação geral dos jogadores.
          </p>
        </Link>
      </div>

      {/* Card de pontuação */}
      <div className="mt-8 rounded-xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">
          Como funciona a pontuação
        </h2>
        <p className="mb-4 text-sm text-blue-700">
          Seus jogadores somam ou perdem pontos conforme as estatísticas nas partidas reais:
        </p>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-blue-800">
            <span>Gol</span>
            <span className="font-medium text-green-700">+{SCORING_RULES.goal}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-blue-800">
            <span>Assistência</span>
            <span className="font-medium text-green-700">+{SCORING_RULES.assist}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-blue-800">
            <span>Acertar o placar</span>
            <span className="font-medium text-green-700">+{SCORING_RULES.correctScore}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-blue-800">
            <span>Jogou 90 min</span>
            <span className="font-medium text-green-700">+{SCORING_RULES.play90Minutes}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-blue-800">
            <span>Clean sheet (GOL/DEF)</span>
            <span className="font-medium text-green-700">+{SCORING_RULES.cleanSheet}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-red-50 px-3 py-2 text-blue-800">
            <span>Cartão amarelo</span>
            <span className="font-medium text-red-700">{SCORING_RULES.yellowCard}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-red-50 px-3 py-2 text-blue-800">
            <span>Gol sofrido (GOL/DEF)</span>
            <span className="font-medium text-red-700">{SCORING_RULES.goalConceded}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-red-50 px-3 py-2 text-blue-800">
            <span>Cartão vermelho</span>
            <span className="font-medium text-red-700">{SCORING_RULES.redCard}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-red-50 px-3 py-2 text-blue-800">
            <span>Pênalti perdido</span>
            <span className="font-medium text-red-700">{SCORING_RULES.missedPenalty}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-red-50 px-3 py-2 text-blue-800">
            <span>Gol contra</span>
            <span className="font-medium text-red-700">{SCORING_RULES.ownGoal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
