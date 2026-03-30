"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/admin";
import { TableShimmer } from "@/components/Shimmer";

interface UserRow {
  userId: string;
  name: string;
  email?: string;
  isPremium?: boolean;
}

export default function AdminUsuariosPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAdmin(user?.email)) {
      router.push("/dashboard");
      return;
    }
  }, [authLoading, isAuthenticated, user?.email, router]);

  useEffect(() => {
    if (!isAdmin(user?.email)) return;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const togglePremium = async (userId: string, current: boolean) => {
    const next = !current;
    try {
      const res = await fetch(`/api/admin/users/${userId}/premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPremium: next }),
      });
      if (!res.ok) throw new Error("Erro");
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, isPremium: next } : u))
      );
    } catch {
      alert("Erro ao atualizar");
    }
  };

  if (authLoading || !isAuthenticated || !isAdmin(user?.email)) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-blue-900">Usuários</h1>
      <p className="mb-6 text-blue-700">
        Defina quais usuários são premium (podem criar ligas).
      </p>

      {loading ? (
        <TableShimmer rows={8} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-blue-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-200 bg-blue-50">
                <th className="px-4 py-3 text-left font-semibold text-blue-900">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">E-mail</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">Plano</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const premium = !!u.isPremium || isAdmin(u.email);
                return (
                  <tr key={u.userId} className="border-b border-blue-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-blue-900">{u.name}</td>
                    <td className="px-4 py-3 text-blue-700">{u.email}</td>
                    <td className="px-4 py-3">
                      {isAdmin(u.email) ? (
                        <span className="text-blue-600">Admin (premium)</span>
                      ) : (
                        <button
                          onClick={() => togglePremium(u.userId, !!u.isPremium)}
                          className={`rounded px-3 py-1 text-xs font-medium ${
                            u.isPremium
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.isPremium ? "Premium" : "Básico"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
