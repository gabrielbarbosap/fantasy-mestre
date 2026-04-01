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
        const fallbackName = String(data?.name ?? "?").trim() || "?";
        return {
          userId: d.id,
          name: fallbackName,
          points: Number(data?.points ?? 0),
          teamName: String(data?.teamName ?? `Time de ${fallbackName}`).trim(),
          photoURL: (data?.photoURL as string)?.trim() || undefined,
        };
      });

      // Sempre prioriza nickname no ranking quando disponível.
      if (entries.length > 0) {
        const [usersSnap, nicknamesSnap] = await Promise.all([
          db.collection("users").get(),
          db.collection("nicknames").get(),
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

        const userMap = new Map<string, { name: string; nickname?: string; photoURL?: string }>();
        usersSnap.docs.forEach((doc) => {
          const u = doc.data();
          const name = String(u?.name ?? u?.email ?? "?").trim();
          const nickname =
            String(u?.nickname ?? "").trim() || nicknameByUserId.get(doc.id) || "";
          userMap.set(doc.id, {
            name,
            nickname: nickname || undefined,
            photoURL: (u?.photoURL as string)?.trim() || undefined,
          });
        });
        entries.forEach((e) => {
          const u = userMap.get(e.userId);
          if (u) {
            const displayName = u.nickname || u.name || e.name;
            if (!e.photoURL && u.photoURL) e.photoURL = u.photoURL;
            e.name = displayName;
            e.teamName = `Time de ${displayName}`;
          }
        });
      }

      return NextResponse.json(entries);
    }

    const [usersSnap, nicknamesSnap, lineupsSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("nicknames").get(),
      db.collection("match_lineups").get(),
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

    const entries: LeaderboardEntry[] = usersSnap.docs
      .filter((d) => userIdsWithLineup.has(d.id))
      .map((d) => {
        const u = d.data();
        const fallbackNickname = nicknameByUserId.get(d.id) || "";
        const displayName = String(
          u?.nickname ?? fallbackNickname ?? u?.name ?? u?.email ?? "?"
        ).trim();
        return {
          userId: d.id,
          name: displayName,
          points: Number(u?.totalPoints ?? 0),
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
