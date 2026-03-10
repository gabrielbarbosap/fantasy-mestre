import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { Player } from "@/types/player";

const DEFAULT_CLUB_ID = "santa-cruz";

export async function fetchAllPlayers(clubId?: string): Promise<Player[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, "players"));
  let players = snapshot.docs.map((d) => ({ playerId: d.id, ...d.data() } as Player));
  if (clubId) {
    players = players.filter(
      (p) => (p.clubId ?? DEFAULT_CLUB_ID) === clubId
    );
  }
  return players;
}

export async function fetchPlayerById(playerId: string): Promise<Player | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, "players", playerId));
  if (!snap.exists()) return null;
  return { playerId: snap.id, ...snap.data() } as Player;
}
