import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

const DEFAULT_CLUB_ID = "santa-cruz";

export interface TopPickedPlayer {
  playerId: string;
  name: string;
  position: string;
  number: number;
  count: number;
}

export interface MostPickedResponse {
  match: { matchId: string; opponent: string; date: string } | null;
  topPicked: TopPickedPlayer[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get("clubId") ?? DEFAULT_CLUB_ID;

    const db = getAdminFirestore();
    const now = new Date();

    const matchesSnap = await db
      .collection("matches")
      .where("status", "==", "scheduled")
      .get();

    interface MatchDoc {
      matchId: string;
      opponent?: string;
      date?: string;
      clubId?: string;
    }
    const upcoming = matchesSnap.docs
      .map((d) => ({ matchId: d.id, ...d.data() } as MatchDoc))
      .filter((m) => {
        const date = m.date ? new Date(m.date) : null;
        const isFuture = date && date > now;
        const sameClub = !m.clubId || m.clubId === clubId;
        return isFuture && sameClub;
      })
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db_ = b.date ? new Date(b.date).getTime() : 0;
        return da - db_;
      });

    const nextMatch = upcoming[0];
    if (!nextMatch) {
      return NextResponse.json({ match: null, topPicked: [] } satisfies MostPickedResponse);
    }
    const matchInfo = {
      matchId: nextMatch.matchId,
      opponent: nextMatch.opponent ?? "?",
      date: nextMatch.date ?? "",
    };

    const lineupsSnap = await db
      .collection("match_lineups")
      .where("matchId", "==", matchInfo.matchId)
      .get();

    const playerCounts: Record<string, number> = {};
    lineupsSnap.docs.forEach((docSnap) => {
      const lineup = docSnap.data();
      const players = (lineup.players ?? {}) as Record<string, boolean>;
      for (const [playerId, selected] of Object.entries(players)) {
        if (selected && playerId) {
          playerCounts[playerId] = (playerCounts[playerId] ?? 0) + 1;
        }
      }
    });

    const sorted = Object.entries(playerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (sorted.length === 0) {
      return NextResponse.json({
        match: matchInfo,
        topPicked: [],
      } satisfies MostPickedResponse);
    }

    const playerIds = sorted.map(([id]) => id);
    const playersSnap = await db.collection("players").get();
    const playerMap = new Map(
      playersSnap.docs.map((d) => {
        const data = d.data();
        return [
          d.id,
          {
            name: String(data?.name ?? "?"),
            position: String(data?.position ?? "?"),
            number: Number(data?.number ?? 0),
          },
        ];
      })
    );

    const topPicked: TopPickedPlayer[] = sorted.map(([playerId, count]) => {
      const p = playerMap.get(playerId);
      return {
        playerId,
        name: p?.name ?? "?",
        position: p?.position ?? "?",
        number: p?.number ?? 0,
        count,
      };
    });

    return NextResponse.json({
      match: matchInfo,
      topPicked,
    } satisfies MostPickedResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[most-picked API] Erro:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
