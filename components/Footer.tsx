import Image from "next/image";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-blue-200 bg-white px-4 py-2 text-center text-[10px] text-blue-600 sm:text-xs">
      <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 shadow-sm">
        <Image
          src="/logo.png"
          alt="Bancada FC"
          width={32}
          height={32}
          className="h-7 w-7 object-contain"
        />
        <span className="font-semibold text-blue-900">Bancada F.C</span>
      </div>
      <p>Este jogo não é afiliado, associado ou patrocinado por qualquer clube, liga ou atleta profissional.</p>
      <p>Todos os dados utilizados são estatísticas públicas.</p>
    </footer>
  );
}
