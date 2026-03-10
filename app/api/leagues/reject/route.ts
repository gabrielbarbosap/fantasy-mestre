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
      return NextResponse.json({ error: "Apenas o dono pode rejeitar" }, { status: 403 });
    }

    const pending = (data.pendingRequestIds ?? []).filter((id: string) => id !== userId);
    await db.collection("leagues").doc(leagueId).update({ pendingRequestIds: pending });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
