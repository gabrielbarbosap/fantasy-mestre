import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

const DEFAULT_PASSWORD = "123456";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
    }

    const auth = getAdminAuth();
    await auth.updateUser(userId, { password: DEFAULT_PASSWORD });

    const db = getAdminFirestore();
    await db
      .collection("users")
      .doc(userId)
      .set({ mustChangePassword: true }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
