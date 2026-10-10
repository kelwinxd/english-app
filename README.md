# English App

App de inglês (MVP): **Aprender** (lições CEFR-J + quiz), **Jogar** (jogo do balão) e **Conversar** (áudio-chat assíncrono com correção). Ver [PLANEJAMENTO.md](./PLANEJAMENTO.md).

Monorepo com npm workspaces.

```
apps/
  api/      Node 20 + Express + TypeScript + Prisma + Zod   → Railway (web)
  worker/   Node + BullMQ (fila de áudio, stub na Fase 0)   → Railway (worker)
  web/      Vite + React + TS + Tailwind + shadcn + PWA      → Vercel
```

## Setup local (Fase 0)

```bash
# na raiz
npm install

# copie o exemplo e preencha
cp .env.example apps/api/.env
cp .env.example apps/web/.env

# Prisma: gere o client (não precisa de banco)
npm run prisma:generate

# suba a API e o front (dois terminais)
npm run dev:api     # http://localhost:3333/health
npm run dev:web     # http://localhost:5173
```

O front chama a API via proxy do Vite (`/api/*` → `http://localhost:3333`), então nenhuma chave vai pro browser.

## Banco (quando tiver Postgres)

```bash
# com DATABASE_URL preenchido em apps/api/.env
npm run prisma:migrate        # cria/migra o schema
curl http://localhost:3333/health/db
```

## Deploy

- **Vercel** (`apps/web`): root = `apps/web`, build `npm run build`, output `dist`. Setar `VITE_API_URL` = URL pública da API.
- **Railway** — um serviço por app, apontando o root de cada um:
  - `api`: root `apps/api`, build Nixpacks, start `npm start`, `prisma migrate deploy` no release.
  - `worker`: root `apps/worker`, start `npm start`.
  - `postgres` + `redis`: plugins gerenciados do Railway.
- Health check do Railway: `GET /health` → 200.

Variáveis de ambiente: painel do Railway/Vercel. **Nunca** commitar `.env`.
