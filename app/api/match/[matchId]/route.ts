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
  photoURL?: string;
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
  homeGoals?: number;
  awayGoals?: number;
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

    const [matchSnap, umSnap, usersSnap, nicknamesSnap, statsSnap, matchPointsSnap, playersSnap] =
      await Promise.all([
        db.collection("matches").doc(matchId).get(),
        db.collection("user_match_points").get(),
        db.collection("users").get(),
        db.collection("nicknames").get(),
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
    const homeGoals = safeNum(matchData.homeGoals);
    const awayGoals = safeNum(matchData.awayGoals);

    const nicknameByUserId = new Map<string, string>();
    nicknamesSnap.docs.forEach((d) => {
      const data = d.data();
      const uid = String(data?.userId ?? data?.uid ?? d.id ?? "").trim();
      const nickname = String(data?.nickname ?? "").trim();
      if (uid && nickname && !nicknameByUserId.has(uid)) {
        nicknameByUserId.set(uid, nickname);
      }
    });

    const userDataMap = new Map<string, { displayName: string; photoURL?: string }>();
    usersSnap.docs.forEach((d) => {
      const u = d.data();
      const nickname =
        String(u?.nickname ?? "").trim() || nicknameByUserId.get(d.id) || "";
      const fallbackName = String(u?.name ?? u?.email ?? "?").trim();
      userDataMap.set(d.id, {
        displayName: nickname || fallbackName,
        photoURL: (u?.photoURL as string) || undefined,
      });
    });

    const users: MatchDetailsUser[] = [];
    umSnap.docs.forEach((d) => {
      const data = d.data();
      const pts = safeNum(data[matchId]);
      if (pts > 0 || data[matchId] !== undefined) {
        const ud = userDataMap.get(d.id);
        users.push({
          userId: d.id,
          name: ud?.displayName ?? "?",
          points: pts,
          position: 0,
          photoURL: ud?.photoURL,
        });
      }
    });

    users.sort((a, b) => b.points - a.points);
    users.forEach((u, i) => {
      u.position = i + 1;
    });

    type PlayerData = { name?: string; number?: number; position?: string; photo?: string };
    const playersMap = new Map<string, PlayerData>();
    playersSnap.docs.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      playersMap.set(d.id, {
        name: data?.name as string | undefined,
        number: data?.number as number | undefined,
        position: data?.position as string | undefined,
        photo: data?.photo as string | undefined,
      });
    });
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
      const pos = String(player?.position ?? "");
      return {
        playerId: pid,
        name: player?.name ?? "?",
        number: safeNum(player?.number),
        position: (posLabels[pos] ?? pos) || "?",
        photo: player?.photo || undefined,
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
      homeGoals,
      awayGoals,
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
