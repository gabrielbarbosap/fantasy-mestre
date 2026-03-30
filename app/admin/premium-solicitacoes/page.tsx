"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/admin";
import { TableShimmer } from "@/components/Shimmer";

interface PremiumRequestRow {
  requestId: string;
  userId: string;
  email: string;
  name: string;
  whatsapp: string;
  createdAt: string;
}

export default function AdminPremiumSolicitacoesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<PremiumRequestRow[]>([]);
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
    fetch("/api/admin/premium-requests")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (authLoading || !isAuthenticated || !isAdmin(user?.email)) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-blue-900">
        Solicitações de Premium
      </h1>
      <p className="mb-6 text-blue-700">
        Usuários que solicitaram virar premium. Aprove em{" "}
        <Link href="/admin/usuarios" className="font-medium text-blue-800 underline">
          Usuários
        </Link>{" "}
        para ativar.
      </p>

      {loading ? (
        <TableShimmer rows={5} />
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
          <p className="text-blue-700">Nenhuma solicitação no momento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-blue-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-200 bg-blue-50">
                <th className="px-4 py-3 text-left font-semibold text-blue-900">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">E-mail</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">WhatsApp</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">Data</th>
                <th className="px-4 py-3 text-left font-semibold text-blue-900">Ação</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.requestId} className="border-b border-blue-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-blue-900">{r.name}</td>
                  <td className="px-4 py-3 text-blue-700">{r.email}</td>
                  <td className="px-4 py-3">
                    {r.whatsapp ? (
                      <a
                        href={`https://wa.me/55${r.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:underline"
                      >
                        {r.whatsapp.length === 11
                          ? r.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
                          : r.whatsapp.length === 10
                            ? r.whatsapp.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
                            : r.whatsapp}
                      </a>
                    ) : (
                      <span className="text-blue-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-blue-600">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href="/admin/usuarios"
                      className="text-blue-600 hover:underline"
                    >
                      Ir para Usuários
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
