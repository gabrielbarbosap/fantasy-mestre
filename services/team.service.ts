import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { Team } from "@/types/team";

export async function createTeam(userId: string): Promise<string> {
  const db = getFirestoreDb();
  const team: Omit<Team, "teamId"> = {
    userId,
    players: {},
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, "teams"), team);
  return ref.id;
}

export async function saveTeam(
  teamId: string,
  playerIds: Record<string, boolean>
): Promise<void> {
  const db = getFirestoreDb();
  const teamRef = doc(db, "teams", teamId);
  const snapshot = await getDoc(teamRef);
  if (!snapshot.exists()) throw new Error("Time não encontrado");

  await updateDoc(teamRef, { players: playerIds });
}

export async function fetchUserTeam(userId: string): Promise<Team | null> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, "teams"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { teamId: d.id, ...d.data() } as Team;
}
