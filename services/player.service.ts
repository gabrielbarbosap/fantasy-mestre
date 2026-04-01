import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { Player } from "@/types/player";

const DEFAULT_CLUB_ID = "santa-cruz";
const POSITION_ORDER: Record<Player["position"], number> = {
  GK: 0,
  DEF: 1,
  MID: 2,
  ATT: 3,
};

export function sortPlayersByDisplayOrder(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const byPosition = (POSITION_ORDER[a.position] ?? 99) - (POSITION_ORDER[b.position] ?? 99);
    if (byPosition !== 0) return byPosition;
    const byNumber = a.number - b.number;
    if (byNumber !== 0) return byNumber;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

export async function fetchAllPlayers(clubId?: string): Promise<Player[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, "players"));
  let players = snapshot.docs.map((d) => ({ playerId: d.id, ...d.data() } as Player));
  if (clubId) {
    players = players.filter(
      (p) => (p.clubId ?? DEFAULT_CLUB_ID) === clubId
    );
  }
  return sortPlayersByDisplayOrder(players);
}

export async function fetchPlayerById(playerId: string): Promise<Player | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, "players", playerId));
  if (!snap.exists()) return null;
  return { playerId: snap.id, ...snap.data() } as Player;
}
