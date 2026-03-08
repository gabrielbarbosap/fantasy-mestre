"use client";

import { useEffect, useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { fetchAllPlayers } from "@/services/player.service";
import type { Player } from "@/types/player";
import type { PlayerPosition } from "@/types/player";

// Faixas do campo: Defesa (GK + DEF), Meio (MID), Ataque (ATT)
const ZONES = {
  DEFESA: ["GK", "DEF"],
  MEIO: ["MID"],
  ATAQUE: ["ATT"],
} as const;

type Zone = keyof typeof ZONES;

const ZONE_LABELS: Record<Zone, string> = {
  DEFESA: "Defesa (Goleiro + Defensores)",
  MEIO: "Meio-campo",
  ATAQUE: "Ataque",
};

function getZone(pos: PlayerPosition): Zone {
  if ((ZONES.DEFESA as readonly string[]).includes(pos)) return "DEFESA";
  if ((ZONES.MEIO as readonly string[]).includes(pos)) return "MEIO";
  return "ATAQUE";
}

export function TeamBuilder({
  initialSelected = {},
  onSave,
  loading = false,
  disabled = false,
}: {
  initialSelected?: Record<string, boolean>;
  onSave: (players: Record<string, boolean>) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>(
    initialSelected
  );
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    fetchAllPlayers()
      .then(setPlayers)
      .finally(() => setLoadingPlayers(false));
  }, []);

  const totalSelected = Object.keys(selected).length;
  const countByZone = (zone: Zone) =>
    Object.entries(selected).filter(([id, sel]) => {
      if (!sel) return false;
      const p = players.find((x) => x.playerId === id);
      return p && (ZONES[zone] as readonly string[]).includes(p.position);
    }).length;

  const hasDefesa = countByZone("DEFESA") >= 1;
  const hasMeio = countByZone("MEIO") >= 1;
  const hasAtaque = countByZone("ATAQUE") >= 1;
  const isValid =
    totalSelected === 5 && hasDefesa && hasMeio && hasAtaque;

  const canSelect = (player: Player) => {
    if (disabled) return false;
    const isSelected = !!selected[player.playerId];
    if (isSelected) return true; // pode desmarcar
    if (totalSelected >= 5) return false; // já tem 5
    return true;
  };

  const togglePlayer = (player: Player) => {
    if (!canSelect(player) && !selected[player.playerId]) return;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[player.playerId]) {
        delete next[player.playerId];
      } else {
        next[player.playerId] = true;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!isValid) return;
    await onSave(selected);
  };

  const activePlayers = players.filter((p) => p.active !== false);
  const byZone = (zone: Zone) =>
    activePlayers.filter((p) => getZone(p.position) === zone);

  if (loadingPlayers) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-blue-600">Carregando jogadores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-blue-700">
          Selecione <strong>5 jogadores</strong>, com pelo menos 1 de cada
          faixa: defesa (goleiro ou zagueiro), meio-campo e ataque.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <span
            className={`font-medium ${
              isValid ? "text-blue-600" : "text-yellow-600"
            }`}
          >
            {totalSelected}/5
          </span>
          <span
            className={`text-sm ${
              hasDefesa ? "text-blue-600" : "text-blue-500"
            }`}
          >
            Defesa {hasDefesa ? "✓" : "—"}
          </span>
          <span
            className={`text-sm ${
              hasMeio ? "text-blue-600" : "text-blue-500"
            }`}
          >
            Meio {hasMeio ? "✓" : "—"}
          </span>
          <span
            className={`text-sm ${
              hasAtaque ? "text-blue-600" : "text-blue-500"
            }`}
          >
            Ataque {hasAtaque ? "✓" : "—"}
          </span>
        </div>
      </div>

      {(Object.keys(ZONES) as Zone[]).map((zone) => (
        <div key={zone}>
          <h3 className="mb-4 text-sm font-semibold uppercase text-blue-600">
            {ZONE_LABELS[zone]}
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {byZone(zone).map((player) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                selected={!!selected[player.playerId]}
                onSelect={() => togglePlayer(player)}
                onDeselect={() => togglePlayer(player)}
                disabled={!canSelect(player) && !selected[player.playerId]}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={!isValid || loading || disabled}
        className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar Time"}
      </button>
    </div>
  );
}
