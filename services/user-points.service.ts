import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { fetchAllMatches } from "./match.service";

export interface UserPoints {
  totalPoints: number;
  pointsByMatch: Array<{ matchId: string; opponent: string; date: string; points: number }>;
}

export async function fetchUserPoints(userId: string): Promise<UserPoints> {
  const db = getFirestoreDb();

  const [userSnap, umSnap, allMatches] = await Promise.all([
    getDoc(doc(db, "users", userId)),
    getDoc(doc(db, "user_match_points", userId)),
    fetchAllMatches(),
  ]);

  const clubId = (userSnap.data()?.clubId as string) || "santa-cruz";
  const matches = allMatches.filter(
    (m) => (m.clubId ?? "santa-cruz") === clubId
  );

  const totalPoints = (userSnap.data()?.totalPoints as number) ?? 0;
  const matchPoints = (umSnap.data() ?? {}) as Record<string, number>;

  const pointsByMatch = matches
    .filter((m) => matchPoints[m.matchId] !== undefined)
    .map((m) => ({
      matchId: m.matchId,
      opponent: m.opponent,
      date: m.date,
      points: matchPoints[m.matchId] ?? 0,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { totalPoints, pointsByMatch };
}
