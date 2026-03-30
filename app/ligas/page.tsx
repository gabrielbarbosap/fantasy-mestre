"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isUserPremium } from "@/lib/user-utils";
import {
  createLeague,
  requestToJoin,
  fetchLeagueById,
  approveRequest,
  rejectRequest,
} from "@/services/league.service";
import { RankingTable } from "@/components/RankingTable";
import { RankingTableShimmer, Shimmer } from "@/components/Shimmer";
import type { League } from "@/types/league";
import type { LeaderboardEntry } from "@/types/database";

export default function LigasPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [leagueRanking, setLeagueRanking] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"minha" | "entrar" | "criar">("minha");
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [premiumRequestSent, setPremiumRequestSent] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [confirmShare, setConfirmShare] = useState(false);
  const [premiumModalError, setPremiumModalError] = useState("");

  const premium = isUserPremium(user?.email, profile?.isPremium);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.uid || !profile?.leagueId) {
      setLeague(null);
      setLeagueRanking([]);
      setLoading(false);
      return;
    }
    fetchLeagueById(profile.leagueId)
      .then(async (l) => {
        setLeague(l ?? null);
        if (l) {
          const r = await fetch(`/api/leagues/ranking?leagueId=${l.leagueId}`);
          if (r.ok) setLeagueRanking(await r.json());
        }
      })
      .finally(() => setLoading(false));
  }, [user?.uid, profile?.leagueId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setCreateError("");
    setActionLoading(true);
    try {
      const { leagueId } = await createLeague(createName.trim(), user.uid);
      const l = await fetchLeagueById(leagueId);
      setLeague(l ?? null);
      setCreateName("");
      setTab("minha");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setJoinError("");
    setActionLoading(true);
    try {
      await requestToJoin(joinCode, user.uid);
      setJoinCode("");
      setJoinError("");
      setTab("minha");
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Erro");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!league || !user?.uid) return;
    setActionLoading(true);
    try {
      await approveRequest(league.leagueId, userId, user.uid);
      const l = await fetchLeagueById(league.leagueId);
      setLeague(l ?? null);
      if (l) {
        const r = await fetch(`/api/leagues/ranking?leagueId=${l.leagueId}`);
        if (r.ok) setLeagueRanking(await r.json());
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    if (!league || !user?.uid) return;
    setActionLoading(true);
    try {
      await rejectRequest(league.leagueId, userId, user.uid);
      const l = await fetchLeagueById(league.leagueId);
      setLeague(l ?? null);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-blue-900">Ligas</h1>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-blue-200">
        <button
          onClick={() => setTab("minha")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "minha"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-blue-600 hover:border-blue-300"
          }`}
        >
          Minha liga
        </button>
        <button
          onClick={() => setTab("entrar")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "entrar"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-blue-600 hover:border-blue-300"
          }`}
        >
          Entrar em liga
        </button>
        <button
          onClick={() => setTab("criar")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "criar"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-blue-600 hover:border-blue-300"
          }`}
        >
          Criar liga
        </button>
      </div>

      {tab === "minha" && (
        <>
          {loading ? (
            <div className="space-y-6">
              <Shimmer className="h-20 w-full rounded-lg" />
              <RankingTableShimmer />
            </div>
          ) : !league ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
              <p className="text-blue-700">Você ainda não participa de nenhuma liga.</p>
              <p className="mt-2 text-sm text-blue-600">
                Crie uma liga (premium) ou peça o código para entrar em uma existente.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-white p-4">
                <h2 className="font-semibold text-blue-900">{league.name}</h2>
                <p className="text-sm text-blue-600">Código: {league.code}</p>
              </div>
              {user && league.ownerId === user.uid && ((league as League & { pendingRequests?: { userId: string; name: string }[] }).pendingRequests?.length ?? 0) > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="mb-2 font-semibold text-amber-900">Solicitações pendentes</h3>
                  <ul className="space-y-2">
                    {((league as League & { pendingRequests?: { userId: string; name: string }[] }).pendingRequests ?? []).map(({ userId, name }) => (
                      <li key={userId} className="flex items-center justify-between rounded bg-white px-3 py-2">
                        <span className="font-medium text-blue-900">{name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(userId)}
                            disabled={actionLoading}
                            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(userId)}
                            disabled={actionLoading}
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="mb-3 font-semibold text-blue-900">Ranking da liga</h3>
                <RankingTable entries={leagueRanking} loading={false} />
              </div>
            </div>
          )}
        </>
      )}

      {tab === "entrar" && (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-blue-800">Código da liga</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              maxLength={6}
              className="w-full max-w-xs rounded-lg border border-blue-300 px-4 py-2 uppercase"
            />
          </div>
          {joinError && <p className="text-sm text-red-600">{joinError}</p>}
          <button
            type="submit"
            disabled={actionLoading || !joinCode.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? "Enviando..." : "Solicitar entrada"}
          </button>
        </form>
      )}

      {tab === "criar" && premium && (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-blue-800">Nome da liga</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Ex: Liga dos Amigos"
              className="w-full max-w-md rounded-lg border border-blue-300 px-4 py-2"
            />
          </div>
          {createError && <p className="text-sm text-red-600">{createError}</p>}
          <button
            type="submit"
            disabled={actionLoading || !createName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? "Criando..." : "Criar liga"}
          </button>
        </form>
      )}

      {tab === "criar" && !premium && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
          <p className="text-blue-700">
            Apenas usuários premium podem criar ligas.
          </p>
          <p className="mt-2 text-sm text-blue-600">
            Solicite virar premium e o administrador entrará em contato pelo WhatsApp.
          </p>
          {premiumRequestSent ? (
            <p className="mt-4 text-sm font-medium text-green-700">
              ✓ Solicitação enviada! O administrador receberá seu contato.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowPremiumModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Quero me tornar premium
            </button>
          )}
        </div>
      )}

      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
              Solicitar premium
            </h3>
            <p className="mb-4 text-sm text-blue-700">
              Informe seu WhatsApp para que o administrador entre em contato.
            </p>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-blue-800">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full rounded-lg border border-blue-300 px-4 py-2"
              />
            </div>
            <label className="mb-4 flex items-start gap-2">
              <input
                type="checkbox"
                checked={confirmShare}
                onChange={(e) => setConfirmShare(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-blue-700">
                Autorizo compartilhar meu número com o administrador para contato sobre o plano premium.
              </span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPremiumModal(false);
                  setWhatsapp("");
                  setConfirmShare(false);
                  setPremiumModalError("");
                }}
                className="flex-1 rounded-lg border border-blue-300 px-4 py-2 text-blue-700 hover:bg-blue-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!user?.uid || !user?.email) return;
                  const clean = whatsapp.replace(/\D/g, "");
                  if (clean.length < 10) {
                    setPremiumModalError("Informe um número de WhatsApp válido.");
                    return;
                  }
                  if (!confirmShare) {
                    setPremiumModalError("Confirme o compartilhamento do número.");
                    return;
                  }
                  setPremiumModalError("");
                  setActionLoading(true);
                  try {
                    const token = user ? await user.getIdToken() : null;
                    if (!token) throw new Error("Faça login novamente.");
                    const res = await fetch("/api/premium-request", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ whatsapp }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error ?? "Erro ao enviar");
                    setPremiumRequestSent(true);
                    setShowPremiumModal(false);
                    setWhatsapp("");
                    setConfirmShare(false);
                  } catch (err) {
                    setPremiumModalError(
                      err instanceof Error ? err.message : "Erro ao enviar. Tente novamente."
                    );
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Enviando..." : "Enviar"}
              </button>
            </div>
            {premiumModalError && (
              <p className="mt-3 text-sm text-red-600">{premiumModalError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
