import { readFileSync } from "fs";
import { resolve } from "path";
import { getAdminAuth, getAdminFirestore } from "../lib/firebase-admin";

const ADMIN_EMAIL = "gabriel@sistemap.com.br";

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
    // Se não existir, segue (pode estar tudo nas variáveis de ambiente)
  }
}

async function deleteCollection(
  collectionName: string,
  keepDocIds: Set<string> = new Set()
): Promise<number> {
  const db = getAdminFirestore();
  const snap = await db.collection(collectionName).get();
  if (snap.empty) return 0;

  let deleted = 0;
  let batch = db.batch();
  let ops = 0;

  for (const d of snap.docs) {
    if (keepDocIds.has(d.id)) continue;
    batch.delete(d.ref);
    deleted++;
    ops++;
    if (ops >= 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) await batch.commit();
  return deleted;
}

async function findAdminUidInAuth(): Promise<string | null> {
  const auth = getAdminAuth();
  let nextPageToken: string | undefined = undefined;

  do {
    const page = await auth.listUsers(1000, nextPageToken);
    const adminUser = page.users.find(
      (u) => (u.email ?? "").trim().toLowerCase() === ADMIN_EMAIL
    );
    if (adminUser) return adminUser.uid;
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return null;
}

async function deleteAuthUsersExceptAdmin(adminUid: string): Promise<number> {
  const auth = getAdminAuth();
  let nextPageToken: string | undefined = undefined;
  let deleted = 0;

  do {
    const page = await auth.listUsers(1000, nextPageToken);
    for (const u of page.users) {
      if (u.uid === adminUid) continue;
      await auth.deleteUser(u.uid);
      deleted++;
    }
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return deleted;
}

async function run() {
  loadEnvFile();
  const db = getAdminFirestore();

  const usersSnap = await db.collection("users").get();
  const adminDoc = usersSnap.docs.find(
    (d) => String(d.data()?.email ?? "").trim().toLowerCase() === ADMIN_EMAIL
  );
  const adminUidFromUsers = adminDoc?.id ?? null;
  const adminUidFromAuth = await findAdminUidInAuth();
  const adminUid = adminUidFromUsers ?? adminUidFromAuth;

  if (!adminUid) {
    throw new Error(
      `Admin (${ADMIN_EMAIL}) não encontrado em users/auth. Limpeza abortada por segurança.`
    );
  }

  console.log(`Admin preservado: ${ADMIN_EMAIL} (uid: ${adminUid})`);

  // 1) Partidas e tudo relacionado às partidas
  const deletedMatches = await deleteCollection("matches");
  const deletedLineups = await deleteCollection("match_lineups");
  const deletedPlayerStats = await deleteCollection("player_match_stats");
  const deletedMatchPoints = await deleteCollection("match_points");

  // user_match_points e leaderboard: mantém só admin, remove restante
  const keepAdmin = new Set<string>([adminUid]);
  const deletedUserMatchPoints = await deleteCollection("user_match_points", keepAdmin);
  const deletedLeaderboard = await deleteCollection("leaderboard", keepAdmin);

  // 2) Dados de usuários de teste
  const deletedPremiumRequests = await deleteCollection("premium_requests", keepAdmin);
  const deletedLeagues = await deleteCollection("leagues");
  const deletedUsers = await deleteCollection("users", keepAdmin);
  const deletedAuthUsers = await deleteAuthUsersExceptAdmin(adminUid);

  console.log("---- LIMPEZA CONCLUÍDA ----");
  console.log(`matches removidas: ${deletedMatches}`);
  console.log(`match_lineups removidas: ${deletedLineups}`);
  console.log(`player_match_stats removidos: ${deletedPlayerStats}`);
  console.log(`match_points removidos: ${deletedMatchPoints}`);
  console.log(`user_match_points removidos: ${deletedUserMatchPoints}`);
  console.log(`leaderboard removidos: ${deletedLeaderboard}`);
  console.log(`premium_requests removidos: ${deletedPremiumRequests}`);
  console.log(`leagues removidas: ${deletedLeagues}`);
  console.log(`users (Firestore) removidos: ${deletedUsers}`);
  console.log(`users (Auth) removidos: ${deletedAuthUsers}`);
}

run().catch((err) => {
  console.error("Erro na limpeza:", err instanceof Error ? err.message : err);
  process.exit(1);
});

