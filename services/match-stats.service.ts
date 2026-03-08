import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { calculatePlayerPoints } from "@/lib/scoring";
import type { PlayerMatchStats } from "@/types/database";
import type { Player } from "@/types/player";

function statsDocId(matchId: string, playerId: string) {
  return `${matchId}_${playerId}`;
}

export async function saveMatchStats(
  matchId: string,
  statsList: Array<Omit<PlayerMatchStats, "matchId"> & { playerId: string }>,
  playersMap: Map<string, Player>
): Promise<{ playerPoints: Record<string, number> }> {
  const db = getFirestoreDb();
  const batch = writeBatch(db);
  const playerPoints: Record<string, number> = {};

  for (const s of statsList) {
    const stats: PlayerMatchStats = {
      matchId,
      playerId: s.playerId,
      goals: s.goals ?? 0,
      assists: s.assists ?? 0,
      yellowCards: s.yellowCards ?? 0,
      redCards: s.redCards ?? 0,
      minutes: s.minutes ?? 0,
      goalsConceded: s.goalsConceded ?? 0,
      ownGoals: s.ownGoals ?? 0,
      missedPenalties: s.missedPenalties ?? 0,
    };

    batch.set(doc(db, "player_match_stats", statsDocId(matchId, s.playerId)), stats);

    const player = playersMap.get(s.playerId);
    const points = player
      ? calculatePlayerPoints(stats, player.position)
      : 0;
    playerPoints[s.playerId] = points;
  }

  await batch.commit();

  // Salva pontos por jogador na partida (para consulta rápida)
  const matchPointsRef = doc(db, "match_points", matchId);
  await setDoc(matchPointsRef, playerPoints);

  return { playerPoints };
}

export async function updateUserAndLeaderboard(
  matchId: string,
  playerPoints: Record<string, number>
): Promise<void> {
  const db = getFirestoreDb();

  // Pontos anteriores desta partida (para recalcular delta)
  const prevMatchPointsSnap = await getDoc(doc(db, "match_points", matchId));
  const prevPlayerPoints = (prevMatchPointsSnap.data() ?? {}) as Record<string, number>;

  const lineupsSnap = await getDocs(
    query(collection(db, "match_lineups"), where("matchId", "==", matchId))
  );
  const usersSnap = await getDocs(collection(db, "users"));

  const userNames: Record<string, string> = {};

  usersSnap.docs.forEach((d) => {
    const u = d.data();
    userNames[d.id] = u.name ?? "";
  });

  const userNewPoints: Record<string, number> = {};
  const userPrevPoints: Record<string, number> = {};

  lineupsSnap.docs.forEach((docSnap) => {
    const lineup = docSnap.data();
    const userId = lineup.userId as string;
    const players = (lineup.players ?? {}) as Record<string, boolean>;

    let newPts = 0;
    let prevPts = 0;
    for (const pid of Object.keys(players)) {
      if (!players[pid]) continue;
      newPts += playerPoints[pid] ?? 0;
      prevPts += prevPlayerPoints[pid] ?? 0;
    }
    userNewPoints[userId] = newPts;
    userPrevPoints[userId] = prevPts;
  });

  const batch = writeBatch(db);

  for (const userId of Object.keys(userNewPoints)) {
    const delta = userNewPoints[userId] - (userPrevPoints[userId] ?? 0);
    if (delta === 0 && userPrevPoints[userId] === undefined) continue;

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const currentTotal = (userSnap.data()?.totalPoints ?? 0) as number;
    const newTotal = currentTotal + delta;

    batch.update(userRef, { totalPoints: newTotal });

    const userMatchRef = doc(db, "user_match_points", userId);
    const umSnap = await getDoc(userMatchRef);
    const umData = (umSnap.exists() ? umSnap.data() : {}) ?? {};
    batch.set(userMatchRef, { ...umData, [matchId]: userNewPoints[userId] });

    const lbRef = doc(db, "leaderboard", userId);
    batch.set(lbRef, {
      userId,
      name: userNames[userId] ?? "?",
      points: newTotal,
      teamName: `Time de ${userNames[userId] ?? "?"}`,
    });
  }

  await batch.commit();
}

export async function getMatchStatsByMatch(
  matchId: string
): Promise<PlayerMatchStats[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, "player_match_stats"),
    where("matchId", "==", matchId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PlayerMatchStats);
}
