"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { fetchUserPoints } from "@/services/user-points.service";
import { HOME_TEAM } from "@/services/match.service";

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();
  const [points, setPoints] = useState<{
    totalPoints: number;
    pointsByMatch: Array<{ matchId: string; opponent: string; date: string; points: number }>;
  } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchUserPoints(user.uid).then(setPoints);
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-blue-600">Carregando...</span>
      </div>
    );
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
        Bem-vindo ao Fantasy Club. Monte seu time e dispute o ranking.
      </p>

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
    </div>
  );
}
