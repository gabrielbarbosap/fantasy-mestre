import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import type { User } from "@/types/user";

export async function register(
  email: string,
  password: string,
  name: string,
  clubId: string,
  photoURL?: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const userData: User = {
    userId: uid,
    name,
    email,
    teamId: "",
    clubId: clubId || "santa-cruz",
    photoURL: photoURL || undefined,
    totalPoints: 0,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", uid), userData);
  return credential;
}

export async function login(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}
