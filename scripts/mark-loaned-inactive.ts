import { readFileSync } from "fs";
import { resolve } from "path";
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

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const LOANED_PLAYERS = [
  { id: "pedro_costa_loan", name: "Pedro Costa", position: "DEF", number: 80 },
  { id: "jonatas_paulista", name: "Jonatas Paulista", position: "MID", number: 81 },
  { id: "thiaguinho_loan", name: "Thiaguinho", position: "ATT", number: 82 },
  { id: "joao_pedro_loan", name: "João Pedro", position: "MID", number: 83 },
  { id: "matheus_melo", name: "Matheus Melo", position: "MID", number: 84 },
  { id: "ruan_robert", name: "Ruan Robert", position: "DEF", number: 85 },
  { id: "richardson_loan", name: "Richardson", position: "MID", number: 86 },
] as const;

async function run() {
  loadEnvFile();
  const db = getAdminFirestore();
  const snap = await db.collection("players").get();

  const targetSet = new Set(LOANED_PLAYERS.map((p) => normalizeName(p.name)));
  const foundNames: string[] = [];
  const notFoundNames = LOANED_PLAYERS.map((p) => p.name);

  const batch = db.batch();
  let updates = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const name = String(data?.name ?? "");
    const normalized = normalizeName(name);
    if (targetSet.has(normalized)) {
      batch.set(d.ref, { active: false }, { merge: true });
      updates++;
      foundNames.push(name);

      const idx = notFoundNames.findIndex(
        (n) => normalizeName(n) === normalized
      );
      if (idx >= 0) notFoundNames.splice(idx, 1);
    }
  }

  if (notFoundNames.length > 0) {
    for (const p of LOANED_PLAYERS.filter((x) => notFoundNames.includes(x.name))) {
      const ref = db.collection("players").doc(p.id);
      batch.set(
        ref,
        {
          name: p.name,
          position: p.position,
          number: p.number,
          active: false,
          clubId: "santa-cruz",
        },
        { merge: true }
      );
      updates++;
    }
  }
  if (updates > 0) await batch.commit();

  console.log(`Jogadores marcados como inativos: ${updates}`);
  if (foundNames.length) {
    console.log("Encontrados:", foundNames.join(", "));
  }
  if (notFoundNames.length) {
    console.log(
      "Não existiam e foram cadastrados como inativos:",
      notFoundNames.join(", ")
    );
  }
}

run().catch((err) => {
  console.error(
    "Erro ao marcar emprestados como inativos:",
    err instanceof Error ? err.message : err
  );
  process.exit(1);
});

