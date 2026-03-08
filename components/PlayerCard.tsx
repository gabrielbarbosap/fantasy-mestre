"use client";

import type { Player } from "@/types/player";

interface PlayerCardProps {
  player: Player;
  selected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  disabled?: boolean;
  /** Exibe apenas informações, sem interação (para lista na página inicial) */
  displayOnly?: boolean;
}

const POSITION_LABELS: Record<string, string> = {
  GK: "Goleiro",
  DEF: "Defensor",
  MID: "Meio-campo",
  ATT: "Atacante",
};

export function PlayerCard({
  player,
  selected = false,
  onSelect,
  onDeselect,
  disabled = false,
  displayOnly = false,
}: PlayerCardProps) {
  const handleClick = () => {
    if (disabled || displayOnly) return;
    selected ? onDeselect?.() : onSelect?.();
  };

  const content = (
    <>
      <div className="mb-2 h-16 w-16 overflow-hidden rounded-full bg-blue-100">
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-500">
            {player.number}
          </span>
        )}
      </div>
      <span className="font-semibold text-blue-900">{player.name}</span>
      <span className="text-sm text-blue-600">
        {POSITION_LABELS[player.position] || player.position} #{player.number}
      </span>
      <span className="mt-1 text-sm font-medium text-blue-700">
        R$ {player.price.toLocaleString("pt-BR")}
      </span>
      {selected && !displayOnly && (
        <span className="mt-2 text-xs font-medium text-yellow-600">
          ✓ Selecionado
        </span>
      )}
    </>
  );

  if (displayOnly) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`flex flex-col items-center rounded-lg border-2 p-4 transition-colors ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-blue-200 bg-white hover:border-blue-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      {content}
    </button>
  );
}
