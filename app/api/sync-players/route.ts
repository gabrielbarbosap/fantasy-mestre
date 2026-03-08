import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { fetchSquad } from "@/services/api-football.service";

const TEAM_ID = "753"; // Santa Cruz

export async function POST() {
  try {
    const players = await fetchSquad(TEAM_ID);
    const db = getFirestoreDb();

    for (const p of players) {
      const { playerId, ...data } = p;
      await setDoc(doc(db, "players", playerId), data);
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
