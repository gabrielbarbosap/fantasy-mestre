"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { logout } from "@/services/auth.service";
import { isAdmin } from "@/lib/admin";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { profile } = useUserProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.photoURL]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  const linkClass = "block py-2 text-blue-900 hover:text-blue-500 lg:py-0";
  const adminLinkClass = "block py-2 text-blue-800 hover:text-blue-400 lg:py-0";
  const navLinks = isAuthenticated ? (
    <>
      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={linkClass}>Dashboard</Link>
      <Link href="/meu-time" onClick={() => setMenuOpen(false)} className={linkClass}>Meu Time</Link>
      <Link href="/team" onClick={() => setMenuOpen(false)} className={linkClass}>Montar time</Link>
      <Link href="/ranking" onClick={() => setMenuOpen(false)} className={linkClass}>Ranking</Link>
      <Link href="/perfil" onClick={() => setMenuOpen(false)} className={linkClass}>Perfil</Link>
      <Link href="/ligas" onClick={() => setMenuOpen(false)} className={linkClass}>Ligas</Link>
      {isAdmin(user?.email) && (
        <Link href="/admin" onClick={() => setMenuOpen(false)} className={adminLinkClass}>
          Admin
        </Link>
      )}
    </>
  ) : (
    <>
      <Link href="/login" onClick={() => setMenuOpen(false)} className={linkClass}>Entrar</Link>
      <Link href="/register" onClick={() => setMenuOpen(false)} className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 lg:py-2">
        Registrar
      </Link>
    </>
  );

  return (
    <nav className="relative border-b border-blue-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" aria-label="Bancada F.C" className="flex items-center">
          <span className="text-lg font-extrabold tracking-wide text-blue-900 sm:text-xl">
            Bancada F.C
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 lg:flex lg:gap-4 xl:gap-6">
          {navLinks}
          {isAuthenticated && (
            <>
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-blue-300 bg-blue-50">
                  {profile?.photoURL && !avatarError ? (
                    <img
                      src={profile.photoURL}
                      alt={profile?.name ?? "Foto de perfil"}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm text-blue-900">
                      {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <span className="max-w-[120px] truncate text-sm text-blue-900 xl:max-w-[180px]">{user?.email}</span>
              </div>
              <button onClick={handleLogout} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Sair
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-900 hover:bg-blue-50 lg:hidden"
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-[53px] z-50 border-b border-blue-200 bg-white shadow-lg lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4">
            <div className="flex flex-col gap-1">
              {navLinks}
            </div>
            {isAuthenticated && (
              <div className="mt-4 flex flex-col gap-2 border-t border-blue-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-blue-300 bg-blue-50">
                    {profile?.photoURL && !avatarError ? (
                      <img
                        src={profile.photoURL}
                        alt={profile?.name ?? "Foto de perfil"}
                        className="h-full w-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm text-blue-900">
                        {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-sm text-blue-900">{user?.email}</span>
                </div>
                <button onClick={handleLogout} className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white">
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
