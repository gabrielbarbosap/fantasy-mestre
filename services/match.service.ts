import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { Match } from "@/types/match";

const HOME_TEAM = "Santa Cruz";

export { HOME_TEAM };

const DEFAULT_CLUB_ID = "santa-cruz";

export async function createMatch(
  opponent: string,
  date: string,
  status: Match["status"] = "scheduled",
  clubId: string = DEFAULT_CLUB_ID
): Promise<string> {
  const db = getFirestoreDb();
  const ref = await addDoc(collection(db, "matches"), {
    opponent,
    date,
    status,
    clubId,
  });
  return ref.id;
}

export async function fetchAllMatches(clubId?: string): Promise<Match[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, "matches"));
  let matches = snapshot.docs.map((d) => ({ matchId: d.id, ...d.data() } as Match));
  if (clubId) {
    matches = matches.filter(
      (m) => (m.clubId ?? DEFAULT_CLUB_ID) === clubId
    );
  }
  return matches;
}

export async function fetchMatchById(matchId: string): Promise<Match | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, "matches", matchId));
  if (!snap.exists()) return null;
  return { matchId: snap.id, ...snap.data() } as Match;
}

export async function updateMatchStatus(
  matchId: string,
  status: Match["status"]
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, "matches", matchId), { status });
}

/** Próxima partida agendada (para verificar bloqueio de edição) */
export async function fetchNextUpcomingMatch(clubId?: string): Promise<Match | null> {
  const matches = await fetchAllMatches(clubId);
  const now = new Date();
  const upcoming = matches
    .filter((m) => m.status === "scheduled" && new Date(m.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return upcoming[0] ?? null;
}

export function isTeamEditLocked(match: Match | null): boolean {
  if (!match) return false;
  const lockTime = new Date(new Date(match.date).getTime() - 60 * 60 * 1000);
  return new Date() >= lockTime;
}
