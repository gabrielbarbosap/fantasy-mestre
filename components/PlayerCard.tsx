"use client";

import type { Player } from "@/types/player";

const POSITION_ABBR: Record<string, string> = {
  GK: "GOL",
  DEF: "DEF",
  MID: "MID",
  ATT: "ATA",
};

const POSITION_ICON: Record<string, string> = {
  GK: "🧤",
  DEF: "🛡",
  MID: "⚙",
  ATT: "⚽",
};

interface PlayerCardProps {
  player: Player;
  selected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  disabled?: boolean;
  /** Exibe apenas informações, sem interação */
  displayOnly?: boolean;
}

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

  const posAbbr = POSITION_ABBR[player.position] ?? player.position;
  const icon = POSITION_ICON[player.position] ?? "•";

  const cardContent = (
    <>
      <div className="mb-2 w-full text-center text-xs font-semibold uppercase tracking-wide text-blue-600">
        {posAbbr} #{player.number}
      </div>
      <div className="my-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
        {icon}
      </div>
      <span className="text-center font-semibold text-blue-900">{player.name}</span>
      {selected && !displayOnly && (
        <span className="mt-2 text-xs font-medium text-yellow-600">✓ Selecionado</span>
      )}
    </>
  );

  const baseClass = "flex w-full flex-col items-center rounded-lg border border-blue-200 bg-white p-4 shadow-sm";

  if (displayOnly) {
    return (
      <div className={`${baseClass}`}>
        {cardContent}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClass} transition-colors ${
        selected ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      {cardContent}
    </button>
  );
}
