"use client";

import { useEffect, useState } from "react";

/** Lock = 1h antes do jogo */
function getLockTime(dateStr: string): Date {
  const d = new Date(dateStr);
  return new Date(d.getTime() - 60 * 60 * 1000);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Prazo encerrado";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const hrs = h % 24;
  const mins = m % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (hrs > 0) parts.push(`${hrs}h`);
  parts.push(`${mins}min`);
  return parts.join(" ");
}

interface MatchCountdownProps {
  matchDate: string;
  prefix?: string;
}

export function MatchCountdown({ matchDate, prefix = "Tempo para editar o time:" }: MatchCountdownProps) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const lockTime = getLockTime(matchDate);
      const now = new Date();
      const ms = lockTime.getTime() - now.getTime();
      setRemaining(formatCountdown(ms));
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [matchDate]);

  if (remaining === null) return null;

  const isExpired = remaining === "Prazo encerrado";

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        isExpired
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
    >
      <p className="text-sm font-medium">
        {prefix} <span className="font-bold">{remaining}</span>
      </p>
      <p className="mt-0.5 text-xs opacity-80">
        Edição bloqueada 1h antes do jogo (horário de Brasília)
      </p>
    </div>
  );
}
