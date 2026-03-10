import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { MatchLineup } from "@/types/lineup";

function lineupDocId(matchId: string, userId: string) {
  return `${matchId}_${userId}`;
}

export async function fetchLineup(
  matchId: string,
  userId: string
): Promise<MatchLineup | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(
    doc(db, "match_lineups", lineupDocId(matchId, userId))
  );
  if (!snap.exists()) return null;
  return { ...snap.data() } as MatchLineup;
}

export async function saveLineup(
  matchId: string,
  userId: string,
  players: Record<string, boolean>,
  placar?: { casa: number; visitante: number }
): Promise<void> {
  const db = getFirestoreDb();
  const id = lineupDocId(matchId, userId);
  const snap = await getDoc(doc(db, "match_lineups", id));

  const data: MatchLineup = {
    matchId,
    userId,
    players,
    placarCasa: placar?.casa,
    placarVisitante: placar?.visitante,
    createdAt: snap.exists()
      ? (snap.data()?.createdAt as string)
      : new Date().toISOString(),
  };

  await setDoc(doc(db, "match_lineups", id), data);
}
