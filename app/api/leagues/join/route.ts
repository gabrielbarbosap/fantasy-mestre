import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { League } from "@/types/league";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId } = body as { code?: string; userId?: string };
    if (!code?.trim() || !userId) {
      return NextResponse.json({ error: "code e userId obrigatórios" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const codeUpper = String(code).trim().toUpperCase();

    const snap = await db.collection("leagues").where("code", "==", codeUpper).limit(1).get();
    if (snap.empty) {
      return NextResponse.json({ error: "Liga não encontrada" }, { status: 404 });
    }

    const doc = snap.docs[0];
    const league = { leagueId: doc.id, ...doc.data() } as League;

    if (league.memberIds?.includes(userId)) {
      return NextResponse.json({ error: "Você já é membro desta liga" }, { status: 400 });
    }

    if (league.pendingRequestIds?.includes(userId)) {
      return NextResponse.json({ error: "Solicitação já enviada. Aguarde aprovação." }, { status: 400 });
    }

    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.data() ?? {};
    if (userData.leagueId) {
      return NextResponse.json({ error: "Você já participa de uma liga. Saia antes de entrar em outra." }, { status: 400 });
    }

    const pending = [...(league.pendingRequestIds ?? []), userId];
    await db.collection("leagues").doc(doc.id).update({ pendingRequestIds: pending });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
