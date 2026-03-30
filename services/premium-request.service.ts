import { doc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export interface PremiumRequest {
  userId: string;
  email: string;
  name: string;
  whatsapp: string;
  createdAt: string;
}

export async function submitPremiumRequest(
  userId: string,
  email: string,
  name: string,
  whatsapp: string
): Promise<void> {
  const db = getFirestoreDb();
  const data: PremiumRequest = {
    userId,
    email: email.trim(),
    name: name.trim() || email.split("@")[0] || "Usuário",
    whatsapp: whatsapp.trim().replace(/\D/g, ""),
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "premium_requests", userId), data, { merge: true });
}
