/**
 * Recalcula e sincroniza a pontuação de todos os usuários a partir de user_match_points.
 * Útil quando os dados ficaram dessincronizados.
 */
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const db = getAdminFirestore();

    const [usersSnap, umSnap, leaderboardSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("user_match_points").get(),
      db.collection("leaderboard").get(),
    ]);

    const batch = db.batch();
    let updated = 0;

    const lineupsSnap = await db.collection("match_lineups").get();
    const userIdsWithLineups = new Set(
      lineupsSnap.docs
        .map((d) => String((d.data().userId as string) ?? "").trim())
        .filter(Boolean)
    );

    userIdsWithLineups.forEach((userId) => {
      const userDoc = usersSnap.docs.find((d) => d.id === userId);
      const userData = userDoc?.data() ?? {};
      const userName = String(userData?.name ?? userData?.email ?? "?").trim();
      const photoURL = (userData?.photoURL as string) || undefined;

      const umDoc = umSnap.docs.find((d) => d.id === userId);
      const matchPoints = (umDoc?.data() ?? {}) as Record<string, number>;

      let total = 0;
      for (const v of Object.values(matchPoints)) {
        if (typeof v === "number" && !isNaN(v)) total += v;
      }

      batch.set(
        db.collection("users").doc(userId),
        { totalPoints: total },
        { merge: true }
      );
      batch.set(db.collection("leaderboard").doc(userId), {
        userId,
        name: userName,
        points: total,
        teamName: `Time de ${userName}`,
        photoURL: photoURL ?? null,
      });
      updated++;
    });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      message: `${updated} usuário(s) sincronizado(s).`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sync-points] Erro:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
