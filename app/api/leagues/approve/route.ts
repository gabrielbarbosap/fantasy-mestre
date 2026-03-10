import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leagueId, userId, ownerId } = body as { leagueId?: string; userId?: string; ownerId?: string };
    if (!leagueId || !userId || !ownerId) {
      return NextResponse.json({ error: "leagueId, userId e ownerId obrigatórios" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const leagueSnap = await db.collection("leagues").doc(leagueId).get();
    if (!leagueSnap.exists) {
      return NextResponse.json({ error: "Liga não encontrada" }, { status: 404 });
    }

    const data = leagueSnap.data()!;
    if (data.ownerId !== ownerId) {
      return NextResponse.json({ error: "Apenas o dono pode aprovar" }, { status: 403 });
    }

    const pending = (data.pendingRequestIds ?? []) as string[];
    if (!pending.includes(userId)) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 400 });
    }

    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.data() ?? {};
    if (userData.leagueId) {
      return NextResponse.json({ error: "Usuário já está em outra liga" }, { status: 400 });
    }

    const newPending = pending.filter((id) => id !== userId);
    const members = [...(data.memberIds ?? []), userId];

    await db.collection("leagues").doc(leagueId).update({ memberIds: members, pendingRequestIds: newPending });
    await db.collection("users").doc(userId).set({ leagueId }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
