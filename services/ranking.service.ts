import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { LeaderboardEntry } from "@/types/database";

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, "leaderboard"),
    orderBy("points", "desc")
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs.map((d) => ({
      userId: d.id,
      ...d.data(),
    })) as LeaderboardEntry[];
  }

  // Fallback: leaderboard vazio, busca usuários com escalação e totalPoints
  const [usersSnap, lineupsSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "match_lineups")),
  ]);
  const userIdsWithLineup = new Set(
    lineupsSnap.docs.map((d) => (d.data().userId as string)?.trim()).filter(Boolean)
  );
  return usersSnap.docs
    .filter((d) => userIdsWithLineup.has(d.id))
    .map((d) => {
      const u = d.data();
      return {
        userId: d.id,
        name: (u.name as string) ?? u.email ?? "?",
        points: (u.totalPoints as number) ?? 0,
        teamName: `Time de ${(u.name as string) ?? "?"}`,
      } as LeaderboardEntry;
    })
    .sort((a, b) => b.points - a.points);
}
