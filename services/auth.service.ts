import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function normalizeNickname(nickname: string): string {
  return nickname.trim().toLowerCase();
}

function mapAuthError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso. Tente entrar ou use outro e-mail.";
    case "auth/invalid-email":
      return "E-mail inválido. Verifique e tente novamente.";
    case "auth/weak-password":
      return "Senha fraca. Use uma senha mais forte.";
    case "auth/network-request-failed":
      return "Falha de conexão. Verifique sua internet e tente novamente.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    default:
      return "Não foi possível concluir o cadastro agora. Tente novamente.";
  }
}

export async function register(
  email: string,
  password: string,
  name: string,
  nickname: string,
  clubId: string,
  photoURL?: string
): Promise<UserCredential> {
  if (!/[A-Z]/.test(password)) {
    throw new Error("A senha deve conter pelo menos uma letra maiúscula.");
  }

  if (!NICKNAME_REGEX.test(nickname.trim())) {
    throw new Error("Nickname inválido. Use 3-20 caracteres (letras, números ou _).");
  }
  if (!photoURL?.trim()) {
    throw new Error("A foto de perfil é obrigatória no cadastro.");
  }

  const auth = getFirebaseAuth();
  const normalizedNickname = normalizeNickname(nickname);
  let credential: UserCredential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(mapAuthError(error));
  }

  try {
    const token = await credential.user.getIdToken(true);
    const res = await fetch("/api/register-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        nickname: nickname.trim(),
        nicknameLower: normalizedNickname,
        clubId: clubId || "santa-cruz",
        photoURL: photoURL.trim(),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? "Não foi possível concluir o cadastro.");
    }

    return credential;
  } catch (error) {
    await deleteUser(credential.user).catch(() => undefined);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Não foi possível concluir o cadastro agora. Tente novamente.");
  }
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
