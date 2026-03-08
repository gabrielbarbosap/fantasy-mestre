import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { Player } from "@/types/player";

export async function fetchAllPlayers(): Promise<Player[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, "players"));
  return snapshot.docs.map((d) => ({ playerId: d.id, ...d.data() } as Player));
}

export async function fetchPlayerById(playerId: string): Promise<Player | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, "players", playerId));
  if (!snap.exists()) return null;
  return { playerId: snap.id, ...snap.data() } as Player;
}
