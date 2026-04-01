"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/admin";

const ADMIN_LINKS = [
  {
    href: "/admin/usuarios",
    title: "Usuarios",
    description: "Gerencie usuarios e acesso premium.",
  },
  {
    href: "/admin/premium-solicitacoes",
    title: "Solicitacoes Premium",
    description: "Veja contatos de quem quer virar premium.",
  },
  {
    href: "/admin/sync-players",
    title: "Sync de Jogadores",
    description: "Sincronize e atualize os dados do elenco.",
  },
  {
    href: "/admin/partida",
    title: "Partidas",
    description: "Crie partidas, lance estatisticas e recalcule pontos.",
  },
];

export default function AdminHomePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

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

  if (authLoading || !isAuthenticated || !isAdmin(user?.email)) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-blue-900">Admin</h1>
      <p className="mb-6 text-blue-700">
        Acesse abaixo todas as areas exclusivas de administracao.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {ADMIN_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-blue-200 bg-white p-5 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <h2 className="mb-1 text-lg font-semibold text-blue-900">{item.title}</h2>
            <p className="text-sm text-blue-700">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
