"use client";

import type { Player } from "@/types/player";

const POS_ICON: Record<string, string> = { GK: "🧤", DEF: "🛡", MID: "⚙", ATT: "⚽" };

/**
 * Posições no campo (percentagens: left, top).
 * Campo visto de cima: nosso gol embaixo (top alto), gol adversário em cima (top baixo).
 * GK = goleiro, DEF = defesa, MID = meio, ATT = ataque.
 * Com 1 jogador na posição → centro. Com 2+ → distribuídos.
 */
const POSITION_TOP: Record<string, number> = {
  GK: 88,
  DEF: 72,
  MID: 50,
  ATT: 28,
};

function getPositionSlot(position: string, indexInPosition: number, totalInPosition: number) {
  const top = POSITION_TOP[position] ?? 50;
  const left =
    totalInPosition === 1
      ? 50
      : totalInPosition === 2
        ? [35, 65][indexInPosition] ?? 50
        : totalInPosition === 3
          ? [30, 50, 70][indexInPosition] ?? 50
          : [25, 40, 60, 75][indexInPosition] ?? 50;
  return { left, top };
}

interface LineupFieldProps {
  players: Player[];
}

export function LineupField({ players }: LineupFieldProps) {
  const byPosition = { GK: [] as Player[], DEF: [] as Player[], MID: [] as Player[], ATT: [] as Player[] };
  players.forEach((p) => {
    const list = byPosition[p.position] ?? byPosition.MID;
    list.push(p);
  });

  return (
    <div className="overflow-hidden rounded-xl border-2 border-blue-200 shadow-lg">
      <div
        className="relative w-full"
        style={{
          aspectRatio: "105/68",
          background:
            "repeating-linear-gradient(90deg, #166534 0px, #166534 40px, #15803d 40px, #15803d 80px)",
        }}
      >
        {/* Círculo do meio */}
        <div
          className="absolute rounded-full border-2 border-white opacity-90"
          style={{
            width: "18%",
            aspectRatio: 1,
            left: "41%",
            top: "41%",
          }}
        />
        {/* Grandes áreas */}
        <div
          className="absolute left-0 right-0 border-t-2 border-b-2 border-white opacity-80"
          style={{ top: "12%", height: "22%", width: "70%", margin: "0 15%" }}
        />
        <div
          className="absolute left-0 right-0 border-t-2 border-b-2 border-white opacity-80"
          style={{ bottom: "12%", height: "22%", width: "70%", margin: "0 15%" }}
        />
        {(["GK", "DEF", "MID", "ATT"] as const).map((pos) =>
          (byPosition[pos] ?? []).map((player, i) => {
            const list = byPosition[pos] ?? [];
            const slot = getPositionSlot(pos, i, list.length);
            return (
              <div
                key={player.playerId}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                }}
              >
                <div className="flex flex-col items-center rounded-lg border-2 border-white bg-white/95 px-2 py-1.5 shadow-md backdrop-blur-sm">
                  <span className="text-[10px] font-bold uppercase text-blue-600">
                    {player.position} #{player.number}
                  </span>
                  <span className="text-base">{POS_ICON[player.position] ?? "•"}</span>
                  <span className="max-w-[72px] truncate text-center text-xs font-semibold text-blue-900">
                    {player.name.split(" ").pop() ?? player.name}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
