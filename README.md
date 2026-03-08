This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Jogadores (API-Football)

Os jogadores reais do Santa Cruz são sincronizados da [API-Football](https://www.api-football.com/documentation-v3).

**Via interface:** Faça login e acesse **Sync** na navbar → clique em "Sincronizar".

**Via terminal:**
```bash
npm run sync-players
```

Configure `API_FOOTBALL_KEY` no `.env.local` (chave em api-football.com).

## Conta de serviço (estatísticas)

Para lançar estatísticas das partidas, é necessário a **conta de serviço** do Firebase (bypassa regras de segurança no servidor):

1. [Firebase Console](https://console.firebase.google.com) → seu projeto → **Configurações** (ícone de engrenagem)
2. **Contas de serviço** → **Gerar nova chave privada**
3. Salve o JSON como `service-account.json` na raiz do projeto
4. O `.env.local` já tem `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`

O arquivo `service-account.json` está no `.gitignore` — **nunca faça commit dele**.

## Dados iniciais (seed)

Para popular partidas de exemplo:

```bash
npm run seed
```

Copie o conteúdo de `firestore.rules` para o Firebase Console.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
