import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

const NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Token de autenticação necessário." }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const userId = decoded.uid;
    const email = decoded.email ?? "";

    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const nickname = String(body?.nickname ?? "").trim();
    const nicknameLower = String(body?.nicknameLower ?? "").trim().toLowerCase();
    const clubId = String(body?.clubId ?? "santa-cruz").trim() || "santa-cruz";
    const photoURLRaw = body?.photoURL;
    const photoURL = typeof photoURLRaw === "string" && photoURLRaw.trim() ? photoURLRaw.trim() : undefined;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }
    if (!NICKNAME_REGEX.test(nickname) || !NICKNAME_REGEX.test(nicknameLower)) {
      return NextResponse.json(
        { error: "Nickname inválido. Use 3-20 caracteres (letras, números ou _)." },
        { status: 400 }
      );
    }
    if (nickname.toLowerCase() !== nicknameLower) {
      return NextResponse.json({ error: "Nickname inválido." }, { status: 400 });
    }
    if (!photoURL) {
      return NextResponse.json({ error: "A foto de perfil é obrigatória." }, { status: 400 });
    }

    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(userId);
    const nicknameRef = db.collection("nicknames").doc(nicknameLower);
    const usersByNicknameQuery = db
      .collection("users")
      .where("nicknameLower", "==", nicknameLower)
      .limit(1);

    await db.runTransaction(async (tx) => {
      const [nickSnap, userSnap, usersByNicknameSnap] = await Promise.all([
        tx.get(nicknameRef),
        tx.get(userRef),
        tx.get(usersByNicknameQuery),
      ]);
      if (nickSnap.exists) {
        const existingUid = String(nickSnap.data()?.userId ?? "");
        if (existingUid && existingUid !== userId) {
          throw new Error("Nickname já está em uso. Escolha outro.");
        }
      }
      const existingUserWithNickname = usersByNicknameSnap.docs.find((d) => d.id !== userId);
      if (existingUserWithNickname) {
        throw new Error("Nickname já está em uso. Escolha outro.");
      }

      const now = new Date().toISOString();
      const existingCreatedAt = userSnap.data()?.createdAt;

      tx.set(
        userRef,
        {
          userId,
          name,
          nickname,
          nicknameLower,
          email,
          teamId: String(userSnap.data()?.teamId ?? ""),
          clubId,
          photoURL,
          totalPoints: Number(userSnap.data()?.totalPoints ?? 0),
          createdAt: typeof existingCreatedAt === "string" && existingCreatedAt ? existingCreatedAt : now,
        },
        { merge: true }
      );

      tx.set(
        nicknameRef,
        {
          userId,
          nickname,
          createdAt: now,
        },
        { merge: true }
      );
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao concluir cadastro.";
    const status = message.includes("Nickname já está em uso") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
