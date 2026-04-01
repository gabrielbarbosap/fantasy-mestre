"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth.service";
import { fileToBase64, validatePhoto } from "@/services/user-photo.service";
import { CLUBS } from "@/types/club";

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clubId, setClubId] = useState(CLUBS[0]?.id ?? "santa-cruz");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validatePhoto(file);
    if (err) {
      setError(err);
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("A senha deve conter pelo menos uma letra maiúscula.");
      return;
    }
    if (!photoFile) {
      setError("A foto de perfil é obrigatória.");
      return;
    }
    setLoading(true);
    try {
      const photoBase64 = await fileToBase64(photoFile);
      await register(email, password, name, nickname, clubId, photoBase64);

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta. Tente outro e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-blue-200 bg-white p-6 shadow-lg sm:p-8">
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
        <h1 className="mb-6 text-2xl font-bold text-blue-900">Criar conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div>
            <label
              htmlFor="nickname"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              Nickname (único)
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              title="Use 3 a 20 caracteres: letras, números ou _"
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use 3 a 20 caracteres: letras, números ou _
            </p>
          </div>
          <div>
            <label
              htmlFor="club"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              Clube que torço
            </label>
            <select
              id="club"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              required
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {CLUBS.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-blue-800">
              Foto (obrigatória)
            </label>
            <p className="mb-2 text-xs text-slate-500">
              Envie JPG, PNG ou WebP com até 5MB.
            </p>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-300 bg-blue-50">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-blue-400">
                    👤
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  required={!photoFile}
                  className="text-sm text-blue-700 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-800 hover:file:bg-blue-200"
                />
                {photoFile && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-left text-xs text-red-600 hover:underline"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>
          </div>
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
              minLength={6}
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Mínimo 6 caracteres e pelo menos 1 letra maiúscula.
            </p>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-blue-800"
            >
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Registrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-blue-700">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-blue-800 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
