import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { fetchSquad } from "@/services/api-football.service";

const TEAM_ID = "753"; // Santa Cruz

export async function POST() {
  try {
    const players = await fetchSquad(TEAM_ID);
    const db = getAdminFirestore();

    const clubId = "santa-cruz";
    for (const p of players) {
      const { playerId, ...data } = p;
      await db.collection("players").doc(playerId).set({ ...data, clubId });
    }

    return NextResponse.json({
      ok: true,
      count: players.length,
      message: `${players.length} jogadores sincronizados com sucesso`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
