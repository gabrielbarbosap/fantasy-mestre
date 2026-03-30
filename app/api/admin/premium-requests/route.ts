import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export interface PremiumRequestRow {
  requestId: string;
  userId: string;
  email: string;
  name: string;
  whatsapp: string;
  createdAt: string;
}

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("premium_requests").get();

    const requests: PremiumRequestRow[] = snap.docs
      .map((d) => {
      const data = d.data();
        return {
          requestId: d.id,
          userId: String(data?.userId ?? d.id),
          email: String(data?.email ?? ""),
          name: String(data?.name ?? "?"),
          whatsapp: String(data?.whatsapp ?? ""),
          createdAt: String(data?.createdAt ?? ""),
        };
      })
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

    return NextResponse.json(requests);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
