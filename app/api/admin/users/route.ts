import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import type { User } from "@/types/user";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("users").get();
    const users: (User & { email?: string })[] = snap.docs.map((d) => ({
      userId: d.id,
      ...d.data(),
    })) as (User & { email?: string })[];
    return NextResponse.json(users);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
