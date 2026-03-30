"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MatchCountdown } from "@/components/MatchCountdown";
import { TeamBuilder } from "@/components/TeamBuilder";
import { Shimmer } from "@/components/Shimmer";
import { fetchLineup, saveLineup } from "@/services/lineup.service";
import {
  fetchNextUpcomingMatch,
  isTeamEditLocked,
} from "@/services/match.service";
import { HOME_TEAM } from "@/services/match.service";
import type { MatchLineup } from "@/types/lineup";
import type { Match } from "@/types/match";

export default function TeamPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { clubId } = useUserProfile();
  const router = useRouter();
  const [lineup, setLineup] = useState<MatchLineup | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editLocked, setEditLocked] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.uid) return;

    fetchNextUpcomingMatch(clubId).then(async (nextMatch) => {
      if (!nextMatch) {
        setMatch(null);
        setLineup(null);
        setLoadingTeam(false);
        return;
      }

      setMatch(nextMatch);
      setEditLocked(isTeamEditLocked(nextMatch));

      const lineupData = await fetchLineup(nextMatch.matchId, user.uid);
      setLineup(
        lineupData ?? {
          matchId: nextMatch.matchId,
          userId: user.uid,
          players: {},
          placarCasa: undefined,
          placarVisitante: undefined,
          createdAt: new Date().toISOString(),
        }
      );
    }).finally(() => setLoadingTeam(false));
  }, [user?.uid, clubId]);

  const handleSave = async (
    players: Record<string, boolean>,
    placar?: { casa: number; visitante: number }
  ) => {
    if (!user?.uid || !match) return;
    setSaving(true);
    try {
      await saveLineup(match.matchId, user.uid, players, placar);
      setLineup((prev) =>
        prev
          ? { ...prev, players, placarCasa: placar?.casa, placarVisitante: placar?.visitante }
          : null
      );
      router.push("/meu-time");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-blue-900">Montar Time</h1>
      <p className="mb-8 text-blue-700">
        Escalação vinculada à partida. Selecione a partida e monte seu time.
      </p>

      {!match ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
          <p className="text-blue-700">
            Nenhuma partida agendada. Crie uma partida em Partidas para montar seu time.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <div className="rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
              <p className="font-medium text-blue-900">
                Partida: {HOME_TEAM} x {match.opponent}
              </p>
              <p className="text-sm text-blue-600">
                {new Date(match.date).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {!editLocked && (
              <MatchCountdown matchDate={match.date} />
            )}
          </div>

          {editLocked && (
            <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
              <p className="font-medium">Edição bloqueada</p>
              <p className="text-sm">
                Os times não podem ser alterados a partir de 1 hora antes do início.
              </p>
            </div>
          )}

          {loadingTeam ? (
            <div className="space-y-6">
              <Shimmer className="h-12 w-64 rounded-lg" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Shimmer key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <TeamBuilder
              clubId={clubId}
              initialSelected={lineup?.players ?? {}}
              initialPlacar={{
                casa: lineup?.placarCasa ?? 0,
                visitante: lineup?.placarVisitante ?? 0,
              }}
              onSave={handleSave}
              loading={saving}
              disabled={editLocked}
            />
          )}
        </>
      )}
    </div>
  );
}
