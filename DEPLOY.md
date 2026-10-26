# Deploy

Monorepo npm workspaces: `apps/api` (back), `apps/web` (front), `apps/worker`.

## Estado atual (protótipo)

- **Front (apps/web):** Vercel. Persistência 100% no `localStorage` (flashcards/SRS,
  progresso). Nada disso depende do back.
- **Back (apps/api):** Express. O único estado de servidor é o **histórico de
  conversas do chat**, hoje **em memória** (some ao reiniciar). Acesso a dados
  isolado atrás de interfaces em `apps/api/src/persistence` — trocar por banco
  depois não toca nas rotas.
- **Banco:** nenhum ainda. O `schema.prisma` existe (datasource Postgres), mas
  não há tabelas reais nem `DATABASE_URL` em uso. A API sobe sem banco (o import
  do Prisma é preguiçoso e só ocorre em `GET /health/db`).

## Railway — publicar a API (`apps/api`)

**Passo obrigatório:** Service → Settings → **Root Directory = `apps/api`**.
Sem isso a Railway builda pela raiz do repo, não acha o `start` (o
`package.json` da raiz não tem) e falha com _"No start command detected"_.

O build usa um **Dockerfile** (`apps/api/Dockerfile`) — determinístico, sem
depender do auto-detect (Railpack/Nixpacks). O `apps/api/railway.json` já
aponta o builder para o Dockerfile e o healthcheck:

- Builder: `DOCKERFILE` (`apps/api/Dockerfile`).
- O Dockerfile roda `npm install` + `npm run build` (`prisma generate` + `tsc`)
  e sobe com `node dist/index.js`.
- Healthcheck: `GET /health`.

`apps/api/package.json` é autocontido (não depende de outros pacotes do
workspace), então instala/builda isolado na subpasta sem problema.

> Alternativa sem Dockerfile: builder Nixpacks/Railpack com Build Command
> `npm install && npm run build` e Start Command `npm run start` — mas exige o
> Root Directory em `apps/api`. O Dockerfile evita esse atrito.

### Variáveis de ambiente (Railway → Variables)

| Variável         | Obrigatória | Observação                                                        |
| ---------------- | ----------- | ----------------------------------------------------------------- |
| `PORT`           | automática  | A Railway injeta; a API faz bind em `0.0.0.0:$PORT`.              |
| `WEB_ORIGIN`     | sim         | URL do front na Vercel (ex.: `https://english-app-j7vn.vercel.app`). CORS. |
| `OPENAI_API_KEY` | sim         | Sem ela, as rotas de chat/TTS/sugestão respondem 503.             |
| `CHAT_MAX_TURNS` | não         | Teto de trocas por conversa (default 20).                         |
| `NODE_ENV`       | recomendado | `production`.                                                     |
| `DATABASE_URL`   | ainda não   | Só quando o banco entrar (ver abaixo).                            |

### Front (Vercel) apontando para a API

No projeto da Vercel, setar `VITE_API_URL` para a URL pública da API na Railway
(ex.: `https://englishapp-api.up.railway.app`) e redeploy.

## Quando o banco entrar (futuro)

A arquitetura já está pronta para isso — passos:

1. Provisionar Postgres (Railway Postgres, Neon, Supabase…) e setar `DATABASE_URL`.
2. Modelar as tabelas no `apps/api/prisma/schema.prisma` (ex.: `conversation`,
   `message`) e gerar a migration local: `npm run prisma:migrate -w @englishapp/api`.
3. Aplicar no deploy: adicionar `prisma migrate deploy` como Release Command na
   Railway (ou ao start).
4. Criar os adapters de banco (ex.: `PrismaConversationStore` implementando
   `ConversationStore`) em `apps/api/src/persistence/` e selecioná-los no
   composition root `apps/api/src/persistence/index.ts` quando `DATABASE_URL`
   existir. **Nenhuma rota muda** — todas dependem só das interfaces.
5. Migrar, quando quiser, o que hoje é `localStorage` no front (SRS/progresso)
   para endpoints que usem esses mesmos repositórios.
