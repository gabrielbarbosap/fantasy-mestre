import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { calculatePlayerPoints } from "@/lib/scoring";
import { SCORING_RULES } from "@/types/database";
import type { Player } from "@/types/player";

function safeNum(v: unknown): number {
  if (typeof v === "number" && !isNaN(v)) return v;
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, statsList, homeGoals = 0, awayGoals = 0 } = body as {
      matchId: string;
      statsList: Array<{
        playerId: string;
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        minutes: number;
        goalsConceded: number;
        ownGoals: number;
        missedPenalties: number;
      }>;
      homeGoals?: number;
      awayGoals?: number;
    };

    if (!matchId || !Array.isArray(statsList) || statsList.length === 0) {
      return NextResponse.json(
        { ok: false, error: "matchId e statsList obrigatórios" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const playersSnap = await db.collection("players").get();
    const players: Player[] = playersSnap.docs.map((d) => ({
      playerId: d.id,
      ...d.data(),
    })) as Player[];
    const playersMap = new Map(players.map((p) => [p.playerId, p]));

    const playerPoints: Record<string, number> = {};

    for (const s of statsList) {
      const pid = String(s.playerId).trim();
      const stats = {
        matchId,
        playerId: pid,
        goals: safeNum(s.goals),
        assists: safeNum(s.assists),
        yellowCards: safeNum(s.yellowCards),
        redCards: safeNum(s.redCards),
        minutes: safeNum(s.minutes),
        goalsConceded: safeNum(s.goalsConceded),
        ownGoals: safeNum(s.ownGoals),
        missedPenalties: safeNum(s.missedPenalties),
      };

      await db.collection("player_match_stats").doc(`${matchId}_${pid}`).set(stats);

      const player = playersMap.get(pid);
      const points = player ? calculatePlayerPoints(stats as any, player.position) : 0;
      playerPoints[pid] = points;
    }

    const prevMatchPointsSnap = await db.collection("match_points").doc(matchId).get();
    const prevData = prevMatchPointsSnap.data() ?? {};
    const prevPlayerPoints: Record<string, number> = {};
    for (const [k, v] of Object.entries(prevData)) {
      const n = safeNum(v);
      prevPlayerPoints[String(k).trim()] = n;
    }

    await db.collection("match_points").doc(matchId).set(playerPoints);

    const matchRef = db.collection("matches").doc(matchId);
    await matchRef.set(
      { homeGoals: safeNum(homeGoals), awayGoals: safeNum(awayGoals) },
      { merge: true }
    );

    const lineupsSnap = await db
      .collection("match_lineups")
      .where("matchId", "==", matchId)
      .get();
    const usersSnap = await db.collection("users").get();

    const userDataMap = new Map<string, { name: string; photoURL?: string }>();
    usersSnap.docs.forEach((d) => {
      const u = d.data();
      userDataMap.set(d.id, {
        name: String(u?.name ?? u?.email ?? "?").trim(),
        photoURL: (u?.photoURL as string) || undefined,
      });
    });

    const userNewPoints: Record<string, number> = {};
    const userPrevPoints: Record<string, number> = {};

    const homeG = safeNum(homeGoals);
    const awayG = safeNum(awayGoals);

    lineupsSnap.docs.forEach((docSnap) => {
      const lineup = docSnap.data();
      const userId = String(lineup.userId ?? "").trim();
      if (!userId) return;

      const playersData = lineup.players as Record<string, unknown> | null | undefined;
      if (!playersData || typeof playersData !== "object") {
        userNewPoints[userId] = 0;
        userPrevPoints[userId] = 0;
        return;
      }

      let newPts = 0;
      let prevPts = 0;
      for (const pid of Object.keys(playersData)) {
        const pidStr = String(pid).trim();
        if (!playersData[pid]) continue;
        newPts += playerPoints[pidStr] ?? 0;
        prevPts += prevPlayerPoints[pidStr] ?? 0;
      }

      const predCasa = safeNum(lineup.placarCasa);
      const predVisit = safeNum(lineup.placarVisitante);
      if (predCasa === homeG && predVisit === awayG) {
        newPts += SCORING_RULES.correctScore;
      }

      userNewPoints[userId] = newPts;
      userPrevPoints[userId] = prevPts;
    });

    const batch = db.batch();
    let usersUpdated = 0;

    for (const userId of Object.keys(userNewPoints)) {
      const delta = userNewPoints[userId] - (userPrevPoints[userId] ?? 0);
      const ud = userDataMap.get(userId);
      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();
      const currentTotal = safeNum(userSnap.data()?.totalPoints);
      const newTotal = currentTotal + delta;

      batch.set(userRef, { totalPoints: newTotal }, { merge: true });

      const userMatchRef = db.collection("user_match_points").doc(userId);
      const umSnap = await userMatchRef.get();
      const umData = umSnap.exists ? (umSnap.data() ?? {}) : {};
      const umPlain: Record<string, number> = {};
      for (const [k, v] of Object.entries(umData)) {
        if (k && typeof v === "number" && !isNaN(v)) {
          umPlain[String(k).trim()] = v;
        }
      }
      umPlain[matchId] = userNewPoints[userId];
      batch.set(userMatchRef, umPlain);

      const lbRef = db.collection("leaderboard").doc(userId);
      batch.set(lbRef, {
        userId,
        name: ud?.name ?? "?",
        points: newTotal,
        teamName: `Time de ${ud?.name ?? "?"}`,
        photoURL: ud?.photoURL ?? null,
      });
      usersUpdated++;
    }

    await batch.commit();

    const total = Object.values(playerPoints).reduce((a, b) => a + b, 0);
    return NextResponse.json({
      ok: true,
      message: `Pontuação lançada. Total na partida: ${total} pts. ${usersUpdated} usuário(s) atualizado(s).`,
      debug: { lineupsCount: lineupsSnap.size },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[match-stats] Erro:", err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
