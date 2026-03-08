import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

function safeNum(v: unknown): number {
  if (typeof v === "number" && !isNaN(v)) return v;
  return 0;
}

export interface MatchDetailsUser {
  userId: string;
  name: string;
  points: number;
  position: number;
}

export interface PlayerMatchStatsItem {
  playerId: string;
  name: string;
  number: number;
  position: string;
  photo?: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  goalsConceded: number;
  ownGoals: number;
  missedPenalties: number;
  points: number;
}

export interface MatchDetailsResponse {
  matchId: string;
  opponent: string;
  date: string;
  status: string;
  users: MatchDetailsUser[];
  playerStats: PlayerMatchStatsItem[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    if (!matchId) {
      return NextResponse.json({ error: "matchId obrigatório" }, { status: 400 });
    }

    const db = getAdminFirestore();

    const [matchSnap, umSnap, usersSnap, statsSnap, matchPointsSnap, playersSnap] =
      await Promise.all([
        db.collection("matches").doc(matchId).get(),
        db.collection("user_match_points").get(),
        db.collection("users").get(),
        db.collection("player_match_stats").where("matchId", "==", matchId).get(),
        db.collection("match_points").doc(matchId).get(),
        db.collection("players").get(),
      ]);

    if (!matchSnap.exists) {
      return NextResponse.json({ error: "Partida não encontrada" }, { status: 404 });
    }

    const matchData = matchSnap.data()!;
    const opponent = String(matchData.opponent ?? "?");
    const date = String(matchData.date ?? "");
    const status = String(matchData.status ?? "finished");

    const userNames = new Map<string, string>();
    usersSnap.docs.forEach((d) => {
      const u = d.data();
      userNames.set(d.id, String(u?.name ?? u?.email ?? "?").trim());
    });

    const users: MatchDetailsUser[] = [];
    umSnap.docs.forEach((d) => {
      const data = d.data();
      const pts = safeNum(data[matchId]);
      if (pts > 0 || data[matchId] !== undefined) {
        users.push({
          userId: d.id,
          name: userNames.get(d.id) ?? "?",
          points: pts,
          position: 0,
        });
      }
    });

    users.sort((a, b) => b.points - a.points);
    users.forEach((u, i) => {
      u.position = i + 1;
    });

    const playersMap = new Map(
      playersSnap.docs.map((d) => [d.id, { ...d.data(), playerId: d.id }])
    );
    const playerPointsData = (matchPointsSnap.data() ?? {}) as Record<string, number>;

    const posLabels: Record<string, string> = {
      GK: "Goleiro",
      DEF: "Defensor",
      MID: "Meio",
      ATT: "Atacante",
    };

    const playerStats: PlayerMatchStatsItem[] = statsSnap.docs.map((d) => {
      const s = d.data();
      const pid = String(s.playerId ?? "");
      const player = playersMap.get(pid);
      const pos = String((player as { position?: string })?.position ?? "");
      return {
        playerId: pid,
        name: (player?.name as string) ?? "?",
        number: safeNum((player as { number?: number })?.number),
        position: (posLabels[pos] ?? pos) || "?",
        photo: (player?.photo as string) || undefined,
        goals: safeNum(s.goals),
        assists: safeNum(s.assists),
        yellowCards: safeNum(s.yellowCards),
        redCards: safeNum(s.redCards),
        minutes: safeNum(s.minutes),
        goalsConceded: safeNum(s.goalsConceded),
        ownGoals: safeNum(s.ownGoals),
        missedPenalties: safeNum(s.missedPenalties),
        points: safeNum(playerPointsData[pid]),
      };
    });

    playerStats.sort((a, b) => b.points - a.points);

    const response: MatchDetailsResponse = {
      matchId,
      opponent,
      date,
      status,
      users,
      playerStats,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[match details] Erro:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
