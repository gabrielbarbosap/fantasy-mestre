# Guia Completo de Deploy — Fantasy Club na Vercel

Siga **cada passo na ordem**. Marque ✓ ao concluir.

---

## ETAPA 1: GitHub (se ainda não tiver o projeto lá)

### 1.1 Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no **+** → **New repository**
3. Nome: `fantasy-club`
4. Deixe **público** e **não** marque "Add a README"
5. Clique em **Create repository**

### 1.2 Enviar o código

No terminal, na pasta do projeto (`c:\Users\gabri\Documents\Programacao\fantasy-club`):

```bash
git init
git add .
git commit -m "Projeto Fantasy Club"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/fantasy-club.git
git push -u origin main
```

**Troque `SEU_USUARIO`** pelo seu usuário do GitHub.

**Importante:** Os arquivos `.env.local` e `service-account.json` **não** serão enviados (estão no .gitignore). Isso é correto por segurança.

---

## ETAPA 2: Vercel

### 2.1 Criar conta e projeto

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Sign Up** → escolha **Continue with GitHub**
3. Autorize a Vercel a acessar seus repositórios
4. Clique em **Add New** → **Project**
5. Selecione o repositório **fantasy-club**
6. Clique em **Import**

### 2.2 Configurar variáveis de ambiente (antes de fazer deploy)

Na tela de configuração do projeto, em **Environment Variables**, adicione **uma a uma**:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Copie do seu `.env.local` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Copie do seu `.env.local` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Copie do seu `.env.local` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Copie do seu `.env.local` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Copie do seu `.env.local` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Copie do seu `.env.local` |
| `API_FOOTBALL_KEY` | Copie do seu `.env.local` |
| `FIREBASE_SERVICE_ACCOUNT` | Veja instrução abaixo |

**Para `FIREBASE_SERVICE_ACCOUNT`:**

1. Abra o arquivo `service-account.json` na raiz do projeto (no Bloco de Notas ou VS Code)
2. Selecione **todo** o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole como valor da variável na Vercel
5. O JSON deve ficar em **uma linha só** — a Vercel aceita assim
6. Marque a variável como **Sensitive** (proteção extra)

### 2.3 Deploy

1. Deixe **Build Command** e **Output Directory** em branco (a Vercel detecta Next.js)
2. Clique em **Deploy**
3. Espere o build terminar (2–5 minutos)
4. Anote a URL: algo como `fantasy-club-xxx.vercel.app` ou `fantasy-club-seu-usuario.vercel.app`

---

## ETAPA 3: Firebase — Autorizar domínio

O login só funciona se o domínio da Vercel estiver autorizado no Firebase.

### 3.1 Adicionar domínio autorizado

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto **fantasy-mestre**
3. No menu lateral: **Build** → **Authentication**
4. Aba **Settings** (ou **Configurações**)
5. Em **Authorized domains**, clique em **Add domain**
6. Adicione:
   - A URL exata do seu deploy (ex: `fantasy-club-abc123.vercel.app`)
   - E também: `*.vercel.app` (para incluir todos os deploys e previews)

---

## ETAPA 4: Firestore — Regras

As regras do Firestore continuam no Firebase e precisam ser publicadas:

```bash
firebase deploy --only firestore
```

Execute na pasta do projeto. Se pedir login: `firebase login`.

---

## ETAPA 5: Testar

1. Abra a URL do deploy (ex: `https://fantasy-club-xxx.vercel.app`)
2. Clique em **Registrar** e crie uma conta
3. Faça login
4. Navegue pelo app (Dashboard, Montar time, etc.)

Se tudo funcionar, o deploy está ok.

---

## Resolução de problemas

### "Missing or insufficient permissions"
- Rode `firebase deploy --only firestore` de novo
- Confira se as regras do Firestore estão corretas

### "Invalid API key" ou erro de Firebase
- Confira se todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estão iguais ao `.env.local`
- Faça um novo deploy na Vercel após alterar variáveis

### Login não funciona / redireciona e não entra
- Verifique se o domínio está em **Authorized domains** no Firebase Auth
- Inclua `*.vercel.app` se ainda não estiver

### Erro nas rotas de API (sync, partida, etc.)
- Confira se `FIREBASE_SERVICE_ACCOUNT` está preenchido corretamente
- O valor deve ser o JSON completo, em uma linha, sem quebras

---

## Checklist final

- [ ] Código no GitHub
- [ ] Projeto importado na Vercel
- [ ] 8 variáveis de ambiente configuradas
- [ ] Deploy concluído
- [ ] Domínio adicionado no Firebase Auth (`*.vercel.app`)
- [ ] `firebase deploy --only firestore` executado
- [ ] Teste de registro e login no site publicado
