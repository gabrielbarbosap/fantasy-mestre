import { readFileSync } from "fs";
import { resolve } from "path";
import { getAdminFirestore } from "../lib/firebase-admin";
import type { PlayerPosition } from "../types/player";

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

type RosterItem = {
  id: string;
  name: string;
  position: PlayerPosition;
  number: number;
  // Mantido apenas para compatibilidade de dados antigos.
  price?: number;
};

const roster: RosterItem[] = [
  // Goleiros
  { id: "thiago_coelho", name: "Thiago Coelho", position: "GK", number: 1, price: 4500000 },
  { id: "rokenedy", name: "Rokenedy", position: "GK", number: 12, price: 3800000 },
  { id: "thiago_henrique", name: "Thiago Henrique", position: "GK", number: 22, price: 3600000 },
  { id: "gabriel_souza", name: "Gabriel Souza", position: "GK", number: 31, price: 3400000 },

  // Defensores (laterais + zagueiros)
  { id: "israel", name: "Israel", position: "DEF", number: 2, price: 5200000 },
  { id: "thiago_ennes", name: "Thiago Ennes", position: "DEF", number: 13, price: 5000000 },
  { id: "willian_alves", name: "Willian Alves", position: "DEF", number: 3, price: 5400000 },
  { id: "eurico_lima", name: "Eurico Lima", position: "DEF", number: 4, price: 5000000 },
  { id: "matheus_vinicius_zag", name: "Matheus Vinicius", position: "DEF", number: 14, price: 4900000 },
  { id: "edson_miranda", name: "Edson Miranda", position: "DEF", number: 15, price: 4800000 },
  { id: "harley_dalyson", name: "Harley Dalyson", position: "DEF", number: 16, price: 5000000 },
  { id: "ze_mario", name: "Zé Mário", position: "DEF", number: 6, price: 5200000 },
  { id: "alex_ruan", name: "Alex Ruan", position: "DEF", number: 26, price: 4700000 },
  { id: "gabriel_rodrigues", name: "Gabriel Rodrigues", position: "DEF", number: 36, price: 4500000 },

  // Meio-campo (volantes + meias)
  { id: "fabinho", name: "Fabinho", position: "MID", number: 5, price: 6200000 },
  { id: "wagner_balotelli", name: "Wagner Balotelli", position: "MID", number: 8, price: 6400000 },
  { id: "gabriel_galhardo", name: "Gabriel Galhardo", position: "MID", number: 17, price: 5900000 },
  { id: "silva", name: "Silva", position: "MID", number: 18, price: 5600000 },
  { id: "leo_costa", name: "Leo Costa", position: "MID", number: 19, price: 6100000 },
  { id: "pedro_favela", name: "Pedro Favela", position: "MID", number: 20, price: 5800000 },
  { id: "andrey", name: "Andrey", position: "MID", number: 21, price: 5600000 },
  { id: "regis", name: "Régis", position: "MID", number: 10, price: 6800000 },
  { id: "patrick_allan", name: "Patrick Allan", position: "MID", number: 11, price: 6500000 },
  { id: "william_junior", name: "William Júnior", position: "MID", number: 23, price: 6000000 },
  { id: "matheus_castilho", name: "Matheus Castilho", position: "MID", number: 24, price: 6200000 },
  { id: "lucas_fabiel", name: "Lucas Fabiel", position: "MID", number: 25, price: 3000000 },

  // Ataque (pontas + centroavantes)
  { id: "renato", name: "Renato", position: "ATT", number: 7, price: 7000000 },
  { id: "robinho", name: "Robinho", position: "ATT", number: 9, price: 6800000 },
  { id: "ronald", name: "Ronald", position: "ATT", number: 27, price: 6500000 },
  { id: "matheus_regis", name: "Matheus Régis", position: "ATT", number: 28, price: 6400000 },
  { id: "nilton", name: "Nilton", position: "ATT", number: 29, price: 6200000 },
  { id: "marquinhos", name: "Marquinhos", position: "ATT", number: 30, price: 6100000 },
  { id: "vitinho", name: "Vitinho", position: "ATT", number: 32, price: 6300000 },
  { id: "vinicius_hora", name: "Vinicius Hora", position: "ATT", number: 33, price: 6400000 },
  { id: "tiago_marques", name: "Tiago Marques", position: "ATT", number: 9, price: 7200000 },
  { id: "quirino", name: "Quirino", position: "ATT", number: 34, price: 6700000 },
  { id: "eron", name: "Eron", position: "ATT", number: 35, price: 6600000 },
  { id: "ryan", name: "Ryan", position: "ATT", number: 37, price: 3000000 },
  { id: "guilherme_barthel", name: "Guilherme Barthel", position: "ATT", number: 38, price: 3000000 },
  { id: "david_cabeca", name: "David Cabeça", position: "DEF", number: 39, price: 3000000 },
];

async function run() {
  loadEnvFile();

  const db = getAdminFirestore();
  const playersCol = db.collection("players");

  const existing = await playersCol.get();
  let batch = db.batch();
  let opCount = 0;

  for (const docSnap of existing.docs) {
    batch.delete(docSnap.ref);
    opCount++;
    if (opCount >= 450) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }
  if (opCount > 0) {
    await batch.commit();
  }

  batch = db.batch();
  opCount = 0;

  for (const p of roster) {
    const ref = playersCol.doc(p.id);
    batch.set(ref, {
      name: p.name,
      position: p.position,
      number: p.number,
      active: true,
      clubId: "santa-cruz",
    });
    opCount++;
    if (opCount >= 450) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }
  if (opCount > 0) {
    await batch.commit();
  }

  console.log(`Elenco atualizado com sucesso: ${roster.length} atletas.`);
}

run().catch((err) => {
  console.error("Erro ao atualizar elenco:", err instanceof Error ? err.message : err);
  process.exit(1);
});

