import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import type { League } from "@/types/league";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const id = searchParams.get("id");
    const db = getAdminFirestore();

    if (id) {
      const snap = await db.collection("leagues").doc(id).get();
      if (!snap.exists) return NextResponse.json(null);
      const data = snap.data()!;
      const league = { leagueId: snap.id, ...data } as League;
      if (league.pendingRequestIds?.length) {
        const usersSnap = await db.collection("users").get();
        const userMap = new Map<string, string>();
        usersSnap.docs.forEach((d) => {
          const u = d.data();
          userMap.set(d.id, String(u?.name ?? u?.email ?? "?"));
        });
        (league as League & { pendingRequests?: { userId: string; name: string }[] }).pendingRequests =
          league.pendingRequestIds.map((uid) => ({
            userId: uid,
            name: userMap.get(uid) ?? "?",
          }));
      }
      return NextResponse.json(league);
    }

    if (code) {
      const snap = await db.collection("leagues").where("code", "==", code.trim().toUpperCase()).limit(1).get();
      if (snap.empty) return NextResponse.json(null);
      const doc = snap.docs[0];
      return NextResponse.json({ leagueId: doc.id, ...doc.data() } as League);
    }

    return NextResponse.json({ error: "code ou id obrigatório" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ownerId } = body as { name?: string; ownerId?: string };
    if (!name?.trim() || !ownerId) {
      return NextResponse.json({ error: "name e ownerId obrigatórios" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const userSnap = await db.collection("users").doc(ownerId).get();
    const userData = userSnap.data() ?? {};
    const isPremium = !!userData.isPremium || isAdmin(userData.email as string);

    if (!isPremium) {
      return NextResponse.json({ error: "Apenas usuários premium podem criar ligas" }, { status: 403 });
    }

    const inLeague = await db.collection("users").doc(ownerId).get();
    const uData = inLeague.data() ?? {};
    if (uData.leagueId) {
      return NextResponse.json({ error: "Você já participa de uma liga. Saia antes de criar outra." }, { status: 400 });
    }

    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const dup = await db.collection("leagues").where("code", "==", code).limit(1).get();
      if (dup.empty) break;
      code = generateCode();
      attempts++;
    }

    const league: Omit<League, "leagueId"> = {
      name: name.trim(),
      code,
      ownerId,
      memberIds: [ownerId],
      pendingRequestIds: [],
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("leagues").add(league);
    await db.collection("users").doc(ownerId).set({ leagueId: ref.id }, { merge: true });

    return NextResponse.json({ leagueId: ref.id, code });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
