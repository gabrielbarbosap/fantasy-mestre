"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { changePassword } from "@/services/auth.service";
import { clearMustChangePassword } from "@/services/user.service";

export default function TrocarSenhaPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(newPassword);
      if (user?.uid) {
        await clearMustChangePassword(user.uid);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-8 shadow-lg">
        <div className="mb-5 flex justify-center">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-2 shadow-md shadow-blue-200/60">
            <Image
              src="/logo.png"
              alt="Bancada FC"
              width={96}
              height={96}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-blue-900">Trocar senha</h1>
        <p className="mb-6 text-sm text-amber-700 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          Sua senha foi redefinida pelo administrador. Crie uma nova senha para continuar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="new-password"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              Nova senha
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Digite sua nova senha"
            />
            <p className="mt-1 text-xs text-slate-500">
              Mínimo 6 caracteres e pelo menos 1 letra maiúscula.
            </p>
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Confirme sua nova senha"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !newPassword.trim() || !confirm.trim()}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
