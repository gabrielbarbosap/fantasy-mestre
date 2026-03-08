"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/admin";

export default function SyncPlayersPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    count?: number;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAdmin(user?.email)) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, user?.email, router]);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/sync-players", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Erro ao sincronizar",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated || !isAdmin(user?.email)) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-blue-900">
        Sincronizar jogadores
      </h1>
      <p className="mb-6 text-blue-700">
        Busca o elenco do Santa Cruz na API-Football e atualiza o Firestore.
      </p>

      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sincronizando..." : "Sincronizar"}
      </button>

      {result && (
        <div
          className={`mt-6 rounded-lg p-4 ${
            result.ok ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-800"
          }`}
        >
          {result.ok ? (
            <p>{result.message ?? `${result.count} jogadores sincronizados`}</p>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
