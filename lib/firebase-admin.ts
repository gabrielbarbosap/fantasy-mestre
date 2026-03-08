import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0] as ReturnType<typeof initializeApp>;
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

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
  } else if (serviceAccountJson) {
    try {
      credential = cert(JSON.parse(serviceAccountJson) as ServiceAccount);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT inválido. Deve ser um JSON válido.");
    }
  } else {
    throw new Error(
      "Configure GOOGLE_APPLICATION_CREDENTIALS (caminho do JSON) ou FIREBASE_SERVICE_ACCOUNT (JSON) em .env.local ou nas variáveis do App Hosting"
    );
  }

  return initializeApp({ credential });
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
