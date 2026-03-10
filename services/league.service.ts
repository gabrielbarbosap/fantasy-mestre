import type { League } from "@/types/league";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function createLeague(
  name: string,
  ownerId: string
): Promise<{ leagueId: string; code: string }> {
  const res = await fetch("/api/leagues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, ownerId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao criar liga");
  }
  return res.json();
}

export async function requestToJoin(leagueCode: string, userId: string): Promise<void> {
  const res = await fetch("/api/leagues/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: leagueCode.toUpperCase().trim(), userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao solicitar entrada");
  }
}

export async function approveRequest(
  leagueId: string,
  userId: string,
  ownerId: string
): Promise<void> {
  const res = await fetch("/api/leagues/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leagueId, userId, ownerId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao aprovar");
  }
}

export async function rejectRequest(
  leagueId: string,
  userId: string,
  ownerId: string
): Promise<void> {
  const res = await fetch("/api/leagues/reject", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leagueId, userId, ownerId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao rejeitar");
  }
}

export async function fetchLeagueByCode(code: string): Promise<League | null> {
  const res = await fetch(`/api/leagues?code=${encodeURIComponent(code.toUpperCase().trim())}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchLeagueById(leagueId: string): Promise<League | null> {
  const res = await fetch(`/api/leagues?id=${encodeURIComponent(leagueId)}`);
  if (!res.ok) return null;
  return res.json();
}
