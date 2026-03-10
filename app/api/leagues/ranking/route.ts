import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { LeaderboardEntry } from "@/types/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get("leagueId");
    if (!leagueId) {
      return NextResponse.json({ error: "leagueId obrigatório" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const leagueSnap = await db.collection("leagues").doc(leagueId).get();
    if (!leagueSnap.exists) {
      return NextResponse.json({ error: "Liga não encontrada" }, { status: 404 });
    }

    const memberIds = (leagueSnap.data()?.memberIds ?? []) as string[];
    if (memberIds.length === 0) {
      return NextResponse.json([]);
    }

    const leaderboardSnap = await db.collection("leaderboard").get();
    const entries: LeaderboardEntry[] = leaderboardSnap.docs
      .filter((d) => memberIds.includes(d.id))
      .map((d) => {
        const data = d.data();
        return {
          userId: d.id,
          name: String(data?.name ?? "?"),
          points: Number(data?.points ?? 0),
          teamName: String(data?.teamName ?? "?"),
          photoURL: (data?.photoURL as string) || undefined,
        };
      })
      .sort((a, b) => b.points - a.points);

    const usersSnap = await db.collection("users").get();
    const userMap = new Map<string, { name: string; photoURL?: string }>();
    usersSnap.docs.forEach((doc) => {
      const u = doc.data();
      userMap.set(doc.id, {
        name: String(u?.name ?? u?.email ?? "?"),
        photoURL: (u?.photoURL as string) || undefined,
      });
    });

    entries.forEach((e) => {
      const u = userMap.get(e.userId);
      if (u) {
        if (!e.photoURL && u.photoURL) e.photoURL = u.photoURL;
        if (e.name === "?") e.name = u.name;
      }
    });

    return NextResponse.json(entries);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
