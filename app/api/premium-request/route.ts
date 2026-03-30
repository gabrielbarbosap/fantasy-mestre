import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação necessário" },
        { status: 401 }
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const userId = decoded.uid;
    const email = decoded.email ?? "";

    const body = await req.json();
    const whatsapp = String(body?.whatsapp ?? "").trim().replace(/\D/g, "");
    if (whatsapp.length < 10) {
      return NextResponse.json(
        { error: "WhatsApp inválido" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.data();
    const name = String(userData?.name ?? userData?.email ?? email.split("@")[0] ?? "Usuário").trim();

    await db.collection("premium_requests").doc(userId).set(
      {
        userId,
        email: email.trim(),
        name: name || "Usuário",
        whatsapp,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[premium-request API] Erro:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
