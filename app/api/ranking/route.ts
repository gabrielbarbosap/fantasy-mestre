import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { LeaderboardEntry } from "@/types/database";

export async function GET() {
  try {
    const db = getAdminFirestore();

    const [usersSnap, nicknamesSnap, lineupsSnap, umSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("nicknames").get(),
      db.collection("match_lineups").get(),
      db.collection("user_match_points").get(),
    ]);

    const nicknameByUserId = new Map<string, string>();
    nicknamesSnap.docs.forEach((d) => {
      const data = d.data();
      const uid = String(data?.userId ?? data?.uid ?? d.id ?? "").trim();
      const nickname = String(data?.nickname ?? "").trim();
      if (uid && nickname && !nicknameByUserId.has(uid)) {
        nicknameByUserId.set(uid, nickname);
      }
    });

    const userIdsWithLineup = new Set(
      lineupsSnap.docs
        .map((d) => String((d.data().userId as string) ?? "").trim())
        .filter(Boolean)
    );

    const matchPointsByUserId = new Map<string, Record<string, unknown>>();
    umSnap.docs.forEach((d) => {
      matchPointsByUserId.set(d.id, (d.data() ?? {}) as Record<string, unknown>);
    });

    const entries: LeaderboardEntry[] = usersSnap.docs
      .filter((d) => userIdsWithLineup.has(d.id))
      .map((d) => {
        const u = d.data();
        const fallbackNickname = nicknameByUserId.get(d.id) || "";
        const displayName = String(
          u?.nickname ?? fallbackNickname ?? u?.name ?? u?.email ?? "?"
        ).trim();
        const perMatch = matchPointsByUserId.get(d.id) ?? {};
        let total = 0;
        for (const v of Object.values(perMatch)) {
          if (typeof v === "number" && !isNaN(v)) total += v;
        }
        return {
          userId: d.id,
          name: displayName,
          points: total,
          teamName: `Time de ${displayName}`,
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
