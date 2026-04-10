"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Shimmer } from "@/components/Shimmer";
import { useAuth } from "@/hooks/useAuth";
import { HOME_TEAM } from "@/services/match.service";

interface MatchDetailsUser {
  userId: string;
  name: string;
  points: number;
  position: number;
  photoURL?: string;
}

interface PlayerMatchStatsItem {
  playerId: string;
  name: string;
  number: number;
  position: string;
  photo?: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  goalsConceded: number;
  ownGoals: number;
  missedPenalties: number;
  points: number;
}

interface ViewerSquadBreakdown {
  lineupFound: boolean;
  players: Array<{
    playerId: string;
    name: string;
    number: number;
    position: string;
    photo?: string;
    points: number;
  }>;
  correctScoreBonus: number;
  squadTotal: number;
}

interface MatchDetails {
  matchId: string;
  opponent: string;
  date: string;
  status: string;
  homeGoals?: number;
  awayGoals?: number;
  users: MatchDetailsUser[];
  playerStats: PlayerMatchStatsItem[];
  viewerSquad?: ViewerSquadBreakdown;
}

export default function PartidaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingExpanded, setRankingExpanded] = useState(false);

  const matchId = params?.matchId as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!matchId || authLoading || !isAuthenticated) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch(`/api/match/${matchId}`, { headers });
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? "Partida não encontrada" : "Erro ao carregar"
          );
        }
        const data = (await res.json()) as MatchDetails;
        if (!cancelled) setDetails(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchId, authLoading, isAuthenticated, user]);

  if (authLoading || !isAuthenticated) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Shimmer className="h-10 w-72 rounded-lg" />
        <Shimmer className="h-64 w-full rounded-xl" />
        <Shimmer className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-800">{error ?? "Partida não encontrada"}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-red-700 underline hover:no-underline"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const myRound =
    user?.uid != null
      ? details.users.find((u) => u.userId === user.uid)
      : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-blue-600 transition-colors hover:text-blue-800"
      >
        ← Voltar
      </Link>

      <div className="mb-8 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-blue-900 sm:text-2xl">
          {HOME_TEAM} x {details.opponent}
          {details.status === "finished" && (
            <span className="ml-3 font-normal text-blue-700">
              {details.homeGoals ?? 0} x {details.awayGoals ?? 0}
            </span>
          )}
        </h1>
        <p className="text-sm text-blue-600">
          {new Date(details.date).toLocaleString("pt-BR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
        <span
          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
            details.status === "finished"
              ? "bg-blue-100 text-blue-800"
              : details.status === "live"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-50 text-blue-600"
          }`}
        >
          {details.status === "finished"
            ? "Encerrada"
            : details.status === "live"
              ? "Ao vivo"
              : "Agendada"}
        </span>
      </div>

      {user?.uid && (details.users.length > 0 || details.viewerSquad) && (
        <div className="mb-6 space-y-4 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
          {(myRound ||
            (details.users.length > 0 && !myRound) ||
            (details.viewerSquad?.lineupFound && details.users.length === 0)) && (
            <div>
              <p className="text-sm font-medium text-blue-800">
                Sua pontuação nesta rodada
              </p>
              {myRound ? (
                <>
                  <p className="mt-1 text-3xl font-bold text-blue-900">
                    {myRound.points}{" "}
                    <span className="text-lg font-semibold text-blue-700">pts</span>
                  </p>
                  <p className="mt-2 text-sm text-blue-700">
                    {myRound.position}º lugar entre {details.users.length}{" "}
                    {details.users.length === 1
                      ? "participante"
                      : "participantes"}
                  </p>
                </>
              ) : details.users.length > 0 ? (
                <p className="mt-2 text-sm text-blue-800">
                  Não há pontuação registrada para o seu time nesta rodada.
                </p>
              ) : details.viewerSquad?.lineupFound ? (
                <p className="mt-1 text-3xl font-bold text-blue-900">
                  {details.viewerSquad.squadTotal}{" "}
                  <span className="text-lg font-semibold text-blue-700">pts</span>
                </p>
              ) : null}
            </div>
          )}

          {details.viewerSquad && (
            <div className="border-t border-blue-200 pt-4">
              <p className="mb-3 text-sm font-semibold text-blue-900">
                Pontos por atleta escalado
              </p>
              {!details.viewerSquad.lineupFound ? (
                <p className="text-sm text-blue-700">
                  Você não montou escalação para esta partida.
                </p>
              ) : details.viewerSquad.players.length === 0 ? (
                <p className="text-sm text-blue-700">
                  Nenhum jogador foi selecionado na sua escalação.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white">
                  <table className="w-full min-w-[280px] text-sm">
                    <thead>
                      <tr className="border-b border-blue-200 bg-blue-50">
                        <th className="px-3 py-2 text-left font-semibold text-blue-900">
                          Atleta
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-blue-900">
                          Nº
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-blue-900">
                          Pos
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-blue-900">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.viewerSquad.players.map((p) => (
                        <tr
                          key={p.playerId}
                          className="border-b border-blue-100 last:border-0"
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-blue-200 bg-blue-50">
                                {p.photo ? (
                                  <Image
                                    src={p.photo}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    sizes="32px"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-blue-600">
                                    {p.name?.charAt(0)?.toUpperCase() ?? "?"}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-blue-900">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center text-blue-700">
                            {p.number}
                          </td>
                          <td className="px-3 py-2 text-blue-700">{p.position}</td>
                          <td className="px-3 py-2 text-right font-semibold text-blue-900">
                            {p.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {details.viewerSquad.lineupFound &&
                details.viewerSquad.correctScoreBonus > 0 && (
                  <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                    Acerto no placar: +
                    {details.viewerSquad.correctScoreBonus} pts
                  </p>
                )}
            </div>
          )}
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-blue-900">
        TOP 3 da rodada
      </h2>

      {details.users.length === 0 ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-12 text-center">
          <p className="text-blue-700">
            Nenhuma pontuação lançada para esta partida ainda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-blue-200">
            <table className="w-full min-w-[300px]">
              <thead>
                <tr className="border-b border-blue-200 bg-blue-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                    Participante
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-900">
                    Pontos
                  </th>
                </tr>
              </thead>
              <tbody>
                {(rankingExpanded ? details.users : details.users.slice(0, 3)).map(
                  (u) => (
                    <tr
                      key={u.userId}
                      className={`border-b border-blue-100 last:border-0 hover:bg-blue-50/50 ${
                        user?.uid === u.userId ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            u.position === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : u.position === 2
                                ? "bg-blue-200 text-blue-800"
                                : u.position === 3
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {u.position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-blue-200 bg-blue-50">
                            {u.photoURL ? (
                              <Image
                                src={u.photoURL}
                                alt={u.name}
                                fill
                                className="object-cover"
                                unoptimized
                                sizes="40px"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-blue-600">
                                {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-blue-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-900">
                        {u.points} pts
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          {details.users.length > 3 && (
            <button
              type="button"
              onClick={() => setRankingExpanded((v) => !v)}
              aria-expanded={rankingExpanded}
              className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-800 shadow-sm transition-colors hover:bg-blue-50 sm:w-auto"
            >
              {rankingExpanded
                ? "Mostrar apenas o top 3"
                : `Ver ranking completo (${details.users.length} participantes)`}
            </button>
          )}
        </div>
      )}

      {details.playerStats && details.playerStats.length > 0 && (
        <>
          <h2 className="mb-4 mt-12 text-lg font-semibold text-blue-900">
            Estatísticas dos jogadores
          </h2>
          <div className="overflow-x-auto rounded-xl border border-blue-200">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-blue-200 bg-blue-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900">
                    Jogador
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    Pos
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    G
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    A
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    CA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    CV
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    Min
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    GC
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    GP
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-900">
                    PP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-blue-900">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.playerStats.map((p) => (
                  <tr
                    key={p.playerId}
                    className="border-b border-blue-100 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center rounded border border-blue-200 bg-blue-50 px-2 py-1">
                          <span className="text-[10px] font-bold uppercase text-blue-600">
                            #{p.number}
                          </span>
                          <span className="text-sm">{p.position === "GK" ? "🧤" : p.position === "DEF" ? "🛡" : p.position === "MID" ? "⚙" : "⚽"}</span>
                        </div>
                        <span className="font-medium text-blue-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-blue-700">
                      {p.position}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{p.goals}</td>
                    <td className="px-4 py-3 text-center text-sm">{p.assists}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {p.yellowCards > 0 ? (
                        <span className="text-amber-600">{p.yellowCards}</span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {p.redCards > 0 ? (
                        <span className="text-red-600">{p.redCards}</span>
                      ) : (
                        0
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-blue-700">
                      {p.minutes}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-blue-700">
                      {p.goalsConceded > 0 ? p.goalsConceded : "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-blue-700">
                      {p.ownGoals > 0 ? p.ownGoals : "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-blue-700">
                      {p.missedPenalties > 0 ? p.missedPenalties : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-900">
                      {p.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-blue-600">
            G = Gols · A = Assistências · CA = Cartão amarelo · CV = Cartão vermelho ·
            Min = Minutos · GC = Gols sofridos · GP = Gol contra · PP = Pênalti perdido
          </p>
        </>
      )}
    </div>
  );
}
