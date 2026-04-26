"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth.service";
import { fetchUserProfile } from "@/services/user.service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await login(email, password);
      const profile = await fetchUserProfile(credential.user.uid);
      if (profile?.mustChangePassword) {
        router.push("/trocar-senha");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError("E-mail ou senha inválidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-blue-200 bg-white p-8 shadow-lg">
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
        <h1 className="mb-6 text-2xl font-bold text-blue-900">Entrar</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-blue-700">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-blue-800 hover:underline">
            Registrar
          </Link>
        </p>
      </div>
    </div>
  );
}
