/**
 * Script para popular o Firestore com dados iniciais.
 * Execute: npm run seed
 * Requer: regras do Firestore permitindo escrita
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

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
  console.error("Arquivo .env.local não encontrado. Execute este script na raiz do projeto.");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const players = [
  { id: "p1", name: "Marcos Silva", position: "GK", number: 1, price: 5000000, active: true },
  { id: "p2", name: "Carlos Santos", position: "GK", number: 12, price: 2500000, active: true },
  { id: "p3", name: "Pedro Costa", position: "GK", number: 22, price: 1500000, active: true },
  { id: "p4", name: "Rafael Oliveira", position: "DEF", number: 2, price: 8000000, active: true },
  { id: "p5", name: "Lucas Ferreira", position: "DEF", number: 3, price: 7500000, active: true },
  { id: "p6", name: "Felipe Souza", position: "DEF", number: 4, price: 10000000, active: true },
  { id: "p7", name: "Bruno Almeida", position: "DEF", number: 5, price: 9000000, active: true },
  { id: "p8", name: "André Lima", position: "DEF", number: 6, price: 6000000, active: true },
  { id: "p9", name: "Henrique Gomes", position: "DEF", number: 13, price: 5500000, active: true },
  { id: "p10", name: "João Paulo", position: "MID", number: 7, price: 12000000, active: true },
  { id: "p11", name: "Matheus Ribeiro", position: "MID", number: 8, price: 15000000, active: true },
  { id: "p12", name: "Gabriel Martins", position: "MID", number: 10, price: 20000000, active: true },
  { id: "p13", name: "Daniel Carvalho", position: "MID", number: 11, price: 11000000, active: true },
  { id: "p14", name: "Rodrigo Pereira", position: "MID", number: 14, price: 7000000, active: true },
  { id: "p15", name: "Eduardo Castro", position: "MID", number: 15, price: 6500000, active: true },
  { id: "p16", name: "Vinícius Rocha", position: "ATT", number: 9, price: 18000000, active: true },
  { id: "p17", name: "Thiago Mendes", position: "ATT", number: 17, price: 14000000, active: true },
  { id: "p18", name: "Lucas Barbosa", position: "ATT", number: 19, price: 13000000, active: true },
  { id: "p19", name: "Fernando Nunes", position: "ATT", number: 20, price: 9000000, active: true },
  { id: "p20", name: "Roberto Silva", position: "ATT", number: 21, price: 8000000, active: true },
];

const matches = [
  { id: "m1", opponent: "Time A", date: "2025-03-15T16:00:00", status: "scheduled" },
  { id: "m2", opponent: "Time B", date: "2025-03-22T16:00:00", status: "scheduled" },
  { id: "m3", opponent: "Time C", date: "2025-03-01T16:00:00", status: "finished" },
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const batch = writeBatch(db);

  console.log("Inserindo jogadores...");
  for (const p of players) {
    const { id, ...data } = p;
    batch.set(doc(db, "players", id), data);
  }

  console.log("Inserindo partidas...");
  for (const m of matches) {
    const { id, ...data } = m;
    batch.set(doc(db, "matches", id), data);
  }

  await batch.commit();

  console.log("Seed concluído com sucesso!");
  console.log(`  - ${players.length} jogadores`);
  console.log(`  - ${matches.length} partidas`);
}

seed().catch((err) => {
  console.error("Erro ao popular o banco:", err.message);
  if (err.message?.includes("PERMISSION_DENIED")) {
    console.log("\nDica: As regras do Firestore podem estar bloqueando writes.");
    console.log("Configure as regras no Firebase Console para permitir escrita em desenvolvimento.");
  }
  process.exit(1);
});
