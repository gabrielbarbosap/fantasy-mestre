import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-4xl font-bold text-zinc-900">Fantasy Club</h1>
      <p className="mb-8 max-w-lg text-center text-zinc-600">
        Monte seu time com os jogadores do clube, acumule pontos nas partidas e
        dispute o ranking com outros torcedores.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
