import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { isPremium } = body as { isPremium?: boolean };

    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
    }

    const db = getAdminFirestore();
    await db.collection("users").doc(userId).set({ isPremium: !!isPremium }, { merge: true });

    return NextResponse.json({ ok: true, isPremium: !!isPremium });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
