import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0] as ReturnType<typeof initializeApp>;
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  let credential;

  if (credentialsPath) {
    try {
      const path = resolve(process.cwd(), credentialsPath);
      const json = JSON.parse(readFileSync(path, "utf-8")) as ServiceAccount;
      credential = cert(json);
    } catch (err) {
      throw new Error(
        `Erro ao carregar ${credentialsPath}: ${err instanceof Error ? err.message : "arquivo inválido"}`
      );
    }
  } else if (serviceAccountBase64) {
    try {
      const jsonStr = Buffer.from(serviceAccountBase64, "base64").toString("utf-8");
      credential = cert(JSON.parse(jsonStr) as ServiceAccount);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 inválido.");
    }
  } else if (serviceAccountJson) {
    try {
      credential = cert(JSON.parse(serviceAccountJson) as ServiceAccount);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT inválido. Deve ser um JSON válido.");
    }
  } else {
    throw new Error(
      "Configure GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT ou FIREBASE_SERVICE_ACCOUNT_BASE64"
    );
  }

  return initializeApp({ credential });
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
