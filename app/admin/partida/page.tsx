"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/admin";
import {
  fetchAllMatches,
  createMatch,
  updateMatchStatus,
} from "@/services/match.service";
import { fetchAllPlayers } from "@/services/player.service";
import { getMatchStatsByMatch } from "@/services/match-stats.service";
import { HOME_TEAM } from "@/services/match.service";
import type { Match } from "@/types/match";
import type { Player } from "@/types/player";
import type { PlayerMatchStats } from "@/types/database";

const DEFENSIVE = ["GK", "DEF"];

type StatCheckboxes = {
  goals: number;
  assists: number;
  played90: boolean;
  goalsConceded: number;
  yellowCard: boolean;
  redCard: boolean;
  ownGoal: boolean;
  missedPenalty: boolean;
};

const defaultStats: StatCheckboxes = {
  goals: 0,
  assists: 0,
  played90: false,
  goalsConceded: 0,
  yellowCard: false,
  redCard: false,
  ownGoal: false,
  missedPenalty: false,
};

export default function PartidaAdminPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [stats, setStats] = useState<Record<string, StatCheckboxes>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [placarCasa, setPlacarCasa] = useState(0);
  const [placarVisitante, setPlacarVisitante] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAdmin(user?.email)) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, user?.email, router]);

  useEffect(() => {
    fetchAllMatches().then(setMatches);
    fetchAllPlayers().then(setPlayers);
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;
    getMatchStatsByMatch(selectedMatch.matchId).then((list) => {
      const m: Record<string, StatCheckboxes> = {};
      list.forEach((s) => {
        m[s.playerId] = {
          goals: s.goals ?? 0,
          assists: s.assists ?? 0,
          played90: (s.minutes ?? 0) >= 90,
          goalsConceded: s.goalsConceded ?? 0,
          yellowCard: (s.yellowCards ?? 0) > 0,
          redCard: (s.redCards ?? 0) > 0,
          ownGoal: (s.ownGoals ?? 0) > 0,
          missedPenalty: (s.missedPenalties ?? 0) > 0,
        };
      });
      setStats(m);
    });
  }, [selectedMatch?.matchId]);

  const updateStat = (playerId: string, field: keyof StatCheckboxes, value: number | boolean) => {
    setStats((prev) => ({
      ...prev,
      [playerId]: { ...defaultStats, ...prev[playerId], [field]: value },
    }));
  };

  const handleCreateMatch = async () => {
    if (!newOpponent.trim() || !newDate) return;
    setCreating(true);
    try {
      const id = await createMatch(newOpponent, newDate, "scheduled", "santa-cruz");
      setMatches((prev) => [
        ...prev,
        { matchId: id, opponent: newOpponent, date: newDate, status: "scheduled", clubId: "santa-cruz" },
      ]);
      setNewOpponent("");
      setNewDate("");
      setMessage({ ok: true, text: "Partida criada. Usuários podem editar times até 1h antes do início." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Erro" });
    } finally {
      setCreating(false);
    }
  };

  const handleFinishMatch = async () => {
    if (!selectedMatch || selectedMatch.status !== "scheduled") return;
    setFinishing(true);
    try {
      await updateMatchStatus(selectedMatch.matchId, "finished");
      setMatches((prev) =>
        prev.map((m) =>
          m.matchId === selectedMatch.matchId ? { ...m, status: "finished" as const } : m
        )
      );
      setSelectedMatch((m) => (m ? { ...m, status: "finished" } : null));
      setMessage({ ok: true, text: "Partida encerrada. Agora você pode lançar os dados." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Erro" });
    } finally {
      setFinishing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMatch || selectedMatch.status !== "finished") return;
    setSaving(true);
    setMessage(null);
    try {
      const statsList: Array<{
        playerId: string;
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        minutes: number;
        goalsConceded: number;
        ownGoals: number;
        missedPenalties: number;
      }> = [];

      for (const p of players) {
        const s = { ...defaultStats, ...stats[p.playerId] };
        const participated =
          s.played90 ||
          s.goals > 0 ||
          s.assists > 0 ||
          s.yellowCard ||
          s.redCard ||
          s.ownGoal ||
          s.missedPenalty ||
          (DEFENSIVE.includes(p.position) && s.goalsConceded > 0);

        if (!participated) continue;

        const minutes = s.played90 ? 90 : 60;
        statsList.push({
          playerId: p.playerId,
          goals: s.goals,
          assists: s.assists,
          yellowCards: s.yellowCard ? 1 : 0,
          redCards: s.redCard ? 1 : 0,
          minutes,
          goalsConceded: s.goalsConceded,
          ownGoals: s.ownGoal ? 1 : 0,
          missedPenalties: s.missedPenalty ? 1 : 0,
        });
      }

      if (statsList.length === 0) {
        setMessage({
          ok: false,
          text: "Marque ao menos um jogador que entrou em campo (90 min, gol, assist, cartão, etc.).",
        });
        setSaving(false);
        return;
      }

      const res = await fetch("/api/match-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.matchId,
          statsList,
          homeGoals: placarCasa,
          awayGoals: placarVisitante,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? "Erro ao salvar" });
        return;
      }
      const msg =
        data.message +
        (data.debug?.lineupsCount === 0
          ? " Nenhuma escalação para esta partida — usuários precisam montar o time na partida primeiro."
          : "");
      setMessage({ ok: true, text: msg });
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Erro ao salvar",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated || !isAdmin(user?.email)) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-blue-900">Partidas</h1>
      <p className="mb-6 text-blue-700">
        Santa Cruz x Adversário (mandante fixo). Crie a partida → usuários editam times até 1h antes → encerre a partida → lance os dados.
      </p>

      {/* Nova partida */}
      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="mb-3 font-semibold text-blue-900">Nova partida</h2>
        <p className="mb-3 text-sm text-blue-700">
          {HOME_TEAM} x
        </p>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Adversário"
            value={newOpponent}
            onChange={(e) => setNewOpponent(e.target.value)}
            className="rounded-lg border border-blue-300 px-3 py-2"
          />
          <input
            type="datetime-local"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded-lg border border-blue-300 px-3 py-2"
          />
          <button
            onClick={handleCreateMatch}
            disabled={creating || !newOpponent.trim() || !newDate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Criando..." : "Criar partida"}
          </button>
        </div>
      </div>

      {/* Lista e ações */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-blue-800">
          Selecione a partida
        </label>
        <select
          value={selectedMatch?.matchId ?? ""}
          onChange={(e) => {
            const m = matches.find((x) => x.matchId === e.target.value);
            setSelectedMatch(m ?? null);
          }}
          className="rounded-lg border border-blue-300 px-4 py-2"
        >
          <option value="">Selecione...</option>
          {matches
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((m) => (
              <option key={m.matchId} value={m.matchId}>
                {HOME_TEAM} x {m.opponent} — {new Date(m.date).toLocaleString("pt-BR")} — {m.status === "scheduled" ? "Agendada" : "Encerrada"}
              </option>
            ))}
        </select>
      </div>

      {selectedMatch && (
        <>
          <div className="mb-4 flex gap-3">
            {selectedMatch.status === "scheduled" && (
              <button
                onClick={handleFinishMatch}
                disabled={finishing}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {finishing ? "Encerrando..." : "Encerrar partida"}
              </button>
            )}
          </div>

          {selectedMatch.status === "finished" && (
            <>
              <p className="mb-4 text-sm text-blue-700">
                Marque com checkboxes o que aconteceu com cada jogador. Só quem entrou em campo precisa estar marcado.
              </p>
              <div className="mb-4 overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-blue-200 bg-blue-50">
                      <th className="px-2 py-2 text-left">Jogador</th>
                      <th className="px-2 py-2 text-center">Gol</th>
                      <th className="px-2 py-2 text-center">Assist</th>
                      <th className="px-2 py-2 text-center">90 min</th>
                      <th className="px-2 py-2 text-center">Gols sof.</th>
                      <th className="px-2 py-2 text-center">CA</th>
                      <th className="px-2 py-2 text-center">CV</th>
                      <th className="px-2 py-2 text-center">Gol contra</th>
                      <th className="px-2 py-2 text-center">Pen. perdido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p) => {
                      const s = { ...defaultStats, ...stats[p.playerId] };
                      const isDef = DEFENSIVE.includes(p.position);
                      return (
                        <tr key={p.playerId} className="border-b border-blue-100">
                          <td className="px-2 py-1 font-medium">
                            {p.name} <span className="text-blue-500">({p.position})</span>
                          </td>
                          {/* Gols: 0,1,2,3 */}
                          <td className="px-1 py-1">
                            <div className="flex gap-0.5 justify-center">
                              {[0, 1, 2, 3].map((n) => (
                                <label key={n} className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`gol-${p.playerId}`}
                                    checked={s.goals === n}
                                    onChange={() => updateStat(p.playerId, "goals", n)}
                                    className="sr-only"
                                  />
                                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs ${s.goals === n ? "border-blue-600 bg-blue-600 text-white" : "border-blue-300"}`}>{n}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          {/* Assistências: 0,1,2 */}
                          <td className="px-1 py-1">
                            <div className="flex gap-0.5 justify-center">
                              {[0, 1, 2].map((n) => (
                                <label key={n} className="cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`assist-${p.playerId}`}
                                    checked={s.assists === n}
                                    onChange={() => updateStat(p.playerId, "assists", n)}
                                    className="sr-only"
                                  />
                                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs ${s.assists === n ? "border-blue-600 bg-blue-600 text-white" : "border-blue-300"}`}>{n}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          {/* Jogou 90 min */}
                          <td className="px-1 py-1 text-center">
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                checked={s.played90}
                                onChange={(e) => updateStat(p.playerId, "played90", e.target.checked)}
                                className="h-4 w-4 rounded border-blue-300"
                              />
                            </label>
                          </td>
                          {/* Gols sofridos (GK/DEF) */}
                          <td className="px-1 py-1">
                            {isDef ? (
                              <div className="flex gap-0.5 justify-center">
                                {[0, 1, 2, 3].map((n) => (
                                  <label key={n} className="cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`ga-${p.playerId}`}
                                      checked={s.goalsConceded === n}
                                      onChange={() => updateStat(p.playerId, "goalsConceded", n)}
                                      className="sr-only"
                                    />
                                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs ${s.goalsConceded === n ? "border-blue-600 bg-blue-600 text-white" : "border-blue-300"}`}>{n}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <span className="text-blue-400">—</span>
                            )}
                          </td>
                          <td className="px-1 py-1 text-center">
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                checked={s.yellowCard}
                                onChange={(e) => updateStat(p.playerId, "yellowCard", e.target.checked)}
                                className="h-4 w-4 rounded border-blue-300"
                              />
                            </label>
                          </td>
                          <td className="px-1 py-1 text-center">
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                checked={s.redCard}
                                onChange={(e) => updateStat(p.playerId, "redCard", e.target.checked)}
                                className="h-4 w-4 rounded border-blue-300"
                              />
                            </label>
                          </td>
                          <td className="px-1 py-1 text-center">
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                checked={s.ownGoal}
                                onChange={(e) => updateStat(p.playerId, "ownGoal", e.target.checked)}
                                className="h-4 w-4 rounded border-blue-300"
                              />
                            </label>
                          </td>
                          <td className="px-1 py-1 text-center">
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                checked={s.missedPenalty}
                                onChange={(e) => updateStat(p.playerId, "missedPenalty", e.target.checked)}
                                className="h-4 w-4 rounded border-blue-300"
                              />
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mb-4 text-xs text-blue-600">
                Gol (0–3) | Assist (0–2) | 90 min = jogou o jogo todo | Gols sof. = goleiro/defesa | CA = cartão amarelo | CV = cartão vermelho
              </p>
              <div className="mb-6 flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <span className="text-sm font-medium text-blue-800">Placar final da partida (Santa Cruz x {selectedMatch.opponent}):</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={placarCasa}
                  onChange={(e) => setPlacarCasa(Number(e.target.value) || 0)}
                  className="w-16 rounded border border-blue-300 px-2 py-1 text-center text-lg font-semibold"
                />
                <span className="text-blue-700">x</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={placarVisitante}
                  onChange={(e) => setPlacarVisitante(Number(e.target.value) || 0)}
                  className="w-16 rounded border border-blue-300 px-2 py-1 text-center text-lg font-semibold"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar e calcular pontos"}
              </button>
            </>
          )}
          <p className="mt-4 text-sm text-blue-600">
            Se a pontuação não atualizou, clique em "Recalcular pontuações".
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={async () => {
                setSyncing(true);
                try {
                  const res = await fetch("/api/sync-points", { method: "POST" });
                  const data = await res.json();
                  setMessage({
                    ok: res.ok,
                    text: data.ok ? data.message : data.error ?? "Erro",
                  });
                } finally {
                  setSyncing(false);
                }
              }}
              disabled={syncing}
              className="rounded-lg border border-blue-300 px-4 py-2 text-sm text-blue-800 hover:bg-blue-50 disabled:opacity-50"
            >
              {syncing ? "Sincronizando..." : "Recalcular pontuações"}
            </button>
          </div>
          {message && (
            <div
              className={`mt-4 rounded-lg p-3 ${
                message.ok ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}
        </>
      )}
    </div>
  );
}
