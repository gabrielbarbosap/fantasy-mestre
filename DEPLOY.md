# Deploy do Fantasy Club no Firebase

## Pré-requisitos

- Node.js 20+
- Firebase CLI 14.4+ (`npm install -g firebase-tools`)
- Conta Firebase com plano **Blaze** (pagamento conforme uso) para App Hosting
- Projeto Firebase configurado (`fantasy-mestre`)

## 1. Login e projeto

```bash
firebase login
firebase use fantasy-mestre
```

## 2. Criar o backend App Hosting (apenas na primeira vez)

Se ainda não criou um backend App Hosting:

```bash
firebase apphosting:backends:create
```

Siga as instruções:
- **Backend ID**: `fantasy-club` (ou o que preferir)
- **Região**: `us-central1` (Iowa) ou `southamerica-east1` (São Paulo) se disponível
- **Root directory**: `.` (raiz do projeto)

## 3. Variáveis de ambiente

Configure as variáveis no Firebase Console:

1. Acesse [Firebase Console](https://console.firebase.google.com) → projeto **fantasy-mestre**
2. Vá em **App Hosting** → seu backend → **Environment variables**
3. Adicione:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Sua API key | Sim |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | fantasy-mestre.firebaseapp.com | Sim |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | fantasy-mestre | Sim |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | fantasy-mestre.firebasestorage.app | Sim |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 700065495050 | Sim |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:700065495050:web:... | Sim |
| `API_FOOTBALL_KEY` | Sua chave da API-Football | Sim |
| `FIREBASE_SERVICE_ACCOUNT` | JSON completo da conta de serviço* | Sim |

\* Para `FIREBASE_SERVICE_ACCOUNT`: em **Firebase Console** → **Configurações** → **Contas de serviço** → **Gerar nova chave privada**. Copie todo o conteúdo do JSON e cole como valor (ou use o recurso de secrets do App Hosting).

## 4. Deploy

```bash
# Deploy completo (Firestore rules + App Hosting)
firebase deploy

# Ou apenas o app
firebase deploy --only apphosting
```

## 5. URL do app

Após o deploy, a URL ficará no formato:

```
https://fantasy-club--fantasy-mestre.us-central1.hosted.app
```

Confira a URL exata no Firebase Console → App Hosting → seu backend.

## Regras do Firestore

Para publicar apenas as regras do Firestore:

```bash
firebase deploy --only firestore
```

## Dicas

- O build usa `npm run build` automaticamente
- O `.gitignore` define o que não é enviado (node_modules, .env, etc.)
- Para domínio personalizado: Firebase Console → App Hosting → Custom domain
