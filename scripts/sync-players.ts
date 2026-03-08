/**
 * Script para sincronizar jogadores da API-Football para o Firestore.
 * Execute: npm run sync-players
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fetchSquad } from "../services/api-football.service";

const TEAM_ID = "753"; // Santa Cruz

// Carrega .env.local
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) process.env[key] = value;
    }
  });
} catch {
  console.error(".env.local não encontrado.");
  process.exit(1);
}

async function sync() {
  const players = await fetchSquad(TEAM_ID);
  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  const db = getFirestore(app);

  for (const p of players) {
    const { playerId, ...data } = p;
    await setDoc(doc(db, "players", playerId), data);
  }

  console.log(`${players.length} jogadores sincronizados.`);
}

sync().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
