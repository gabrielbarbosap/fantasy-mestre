import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { User } from "@/types/user";

export async function fetchUserProfile(userId: string): Promise<User | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return { userId: snap.id, ...snap.data() } as User;
}

export async function updateUserClub(
  userId: string,
  clubId: string
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, "users", userId), { clubId });
}

export async function updateUserPhoto(
  userId: string,
  photoURL: string | null
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, "users", userId), { photoURL: photoURL || null });
}

export async function clearMustChangePassword(userId: string): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, "users", userId), { mustChangePassword: false });
}
