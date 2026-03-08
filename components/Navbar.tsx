"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth.service";
import { isAdmin } from "@/lib/admin";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b border-blue-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">
          Fantasy Club
        </Link>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-blue-600 transition-colors hover:text-blue-800"
              >
                Dashboard
              </Link>
              <Link
                href="/meu-time"
                className="text-blue-600 transition-colors hover:text-blue-800"
              >
                Meu Time
              </Link>
              <Link
                href="/team"
                className="text-blue-600 transition-colors hover:text-blue-800"
              >
                Montar time
              </Link>
              <Link href="/ranking" className="text-blue-600 transition-colors hover:text-blue-800">
                Ranking
              </Link>
              {isAdmin(user?.email) && (
                <>
                  <Link
                    href="/admin/sync-players"
                    className="text-blue-500 transition-colors hover:text-blue-700"
                    title="Sincronizar jogadores da API"
                  >
                    Sync
                  </Link>
                  <Link
                    href="/admin/partida"
                    className="text-blue-500 transition-colors hover:text-blue-700"
                    title="Lançar dados da partida"
                  >
                    Partida
                  </Link>
                </>
              )}
              <span className="text-sm text-blue-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-blue-600 transition-colors hover:text-blue-800"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Registrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
