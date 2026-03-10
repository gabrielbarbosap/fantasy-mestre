"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { updateUserClub, updateUserPhoto } from "@/services/user.service";
import { fileToBase64, validatePhoto } from "@/services/user-photo.service";
import { CLUBS } from "@/types/club";

export default function PerfilPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { profile, clubId, refetch } = useUserProfile();
  const router = useRouter();
  const [selectedClubId, setSelectedClubId] = useState(clubId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    setSelectedClubId(clubId);
  }, [clubId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validatePhoto(file);
    if (err) {
      setMessage(err);
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setMessage(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhotoSelection = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSavePhoto = async () => {
    if (!user?.uid || !photoFile) return;
    setSaving(true);
    setMessage(null);
    try {
      const photoBase64 = await fileToBase64(photoFile);
      await updateUserPhoto(user.uid, photoBase64);
      refetch();
      setMessage("Foto atualizada com sucesso!");
      setPhotoFile(null);
      handleRemovePhotoSelection();
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage("Erro ao enviar foto. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClub = async () => {
    if (!user?.uid || selectedClubId === clubId) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateUserClub(user.uid, selectedClubId);
      setMessage("Clube atualizado com sucesso!");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage("Erro ao atualizar clube. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-blue-600 transition-colors hover:text-blue-800"
      >
        ← Voltar
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-blue-900">Meu perfil</h1>
      <p className="mb-8 text-blue-700">
        Gerencie suas informações e o clube que você torce.
      </p>

      <div className="mb-8 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm text-blue-600">Foto</p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-blue-300 bg-blue-50">
            {(photoPreview || profile?.photoURL) ? (
              <Image
                src={photoPreview || profile!.photoURL!}
                alt={profile?.name ?? "Foto"}
                fill
                className="object-cover"
                unoptimized
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl text-blue-400">
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
              className="text-sm text-blue-700 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-800 hover:file:bg-blue-200"
            />
            {photoFile && (
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Enviando..." : "Salvar foto"}
              </button>
            )}
            {photoFile && (
              <button
                type="button"
                onClick={handleRemovePhotoSelection}
                className="text-left text-xs text-red-600 hover:underline"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm text-blue-600">Nome</p>
        <p className="font-medium text-blue-900">{profile?.name ?? "—"}</p>
      </div>

      <div className="mb-8 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm text-blue-600">E-mail</p>
        <p className="font-medium text-blue-900">{user?.email ?? "—"}</p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="club"
          className="mb-2 block text-sm font-medium text-blue-800"
        >
          Clube que torço
        </label>
        <select
          id="club"
          value={selectedClubId}
          onChange={(e) => setSelectedClubId(e.target.value)}
          className="mb-4 w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          {CLUBS.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
        {selectedClubId !== clubId && (
          <button
            onClick={handleSaveClub}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar clube"}
          </button>
        )}
      </div>

      {message && (
        <p
          className={`mt-4 text-sm ${message.includes("sucesso") ? "text-blue-700" : "text-red-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
