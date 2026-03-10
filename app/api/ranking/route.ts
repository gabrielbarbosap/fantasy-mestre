import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { LeaderboardEntry } from "@/types/database";

export async function GET() {
  try {
    const db = getAdminFirestore();

    const leaderboardSnap = await db
      .collection("leaderboard")
      .orderBy("points", "desc")
      .get();

    if (!leaderboardSnap.empty) {
      const entries: LeaderboardEntry[] = leaderboardSnap.docs.map((d) => {
        const data = d.data();
        return {
          userId: d.id,
          name: String(data?.name ?? "?").trim() || "?",
          points: Number(data?.points ?? 0),
          teamName: String(data?.teamName ?? `Time de ${data?.name ?? "?"}`).trim(),
          photoURL: (data?.photoURL as string)?.trim() || undefined,
        };
      });

      const missingIds = entries
        .filter((e) => !e.photoURL || e.name === "?")
        .map((e) => e.userId);
      if (missingIds.length > 0) {
        const usersSnap = await db.collection("users").get();
        const userMap = new Map<string, { name: string; photoURL?: string }>();
        usersSnap.docs.forEach((doc) => {
          const u = doc.data();
          userMap.set(doc.id, {
            name: String(u?.name ?? u?.email ?? "?").trim(),
            photoURL: (u?.photoURL as string)?.trim() || undefined,
          });
        });
        entries.forEach((e) => {
          const u = userMap.get(e.userId);
          if (u) {
            if (!e.photoURL && u.photoURL) e.photoURL = u.photoURL;
            if (e.name === "?" && u.name) e.name = u.name;
          }
        });
      }

      return NextResponse.json(entries);
    }

    const [usersSnap, lineupsSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("match_lineups").get(),
    ]);

    const userIdsWithLineup = new Set(
      lineupsSnap.docs
        .map((d) => String((d.data().userId as string) ?? "").trim())
        .filter(Boolean)
    );

    const entries: LeaderboardEntry[] = usersSnap.docs
      .filter((d) => userIdsWithLineup.has(d.id))
      .map((d) => {
        const u = d.data();
        return {
          userId: d.id,
          name: String(u?.name ?? u?.email ?? "?"),
          points: Number(u?.totalPoints ?? 0),
          teamName: `Time de ${String(u?.name ?? "?")}`,
          photoURL: (u?.photoURL as string) || undefined,
        };
      })
      .sort((a, b) => b.points - a.points);

    return NextResponse.json(entries);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ranking API] Erro:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
