import { readFileSync } from "fs";
import { resolve } from "path";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../lib/firebase-admin";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) continue;
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.error(".env.local não encontrado.");
    process.exit(1);
  }
}

async function run() {
  loadEnvFile();
  const db = getAdminFirestore();
  const snap = await db.collection("players").get();

  if (snap.empty) {
    console.log("Nenhum jogador encontrado.");
    return;
  }

  let batch = db.batch();
  let ops = 0;
  let updated = 0;

  for (const d of snap.docs) {
    batch.set(d.ref, { price: FieldValue.delete() }, { merge: true });
    ops++;
    updated++;
    if (ops >= 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) await batch.commit();
  console.log(`Campo price removido de ${updated} jogadores.`);
}

run().catch((err) => {
  console.error("Erro ao remover price:", err instanceof Error ? err.message : err);
  process.exit(1);
});

