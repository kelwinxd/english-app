# Planejamento — App de Inglês (MVP)

> Baseado em `mvp-ingles-escopo.md` e `mvp-ingles-stack-tecnica.md`.
> Meta: MVP construível por **1 dev solo em 2–3 meses**, com escopo mantido firme.
> Data do plano: 2026-10-06.

---

## 1. Objetivo do MVP

Entregar um app de inglês instalável (PWA) com três pilares:

- **Aprender** — lições CEFR-J + quiz de múltipla escolha.
- **Jogar** — jogo do balão alimentado pelo nível/tópico do usuário.
- **Conversar** — áudio-chat assíncrono com personagem + correção estruturada.

Métrica visível ao usuário: **"quanto do CEFR-J B1 você domina"** — concreta, sem streak/XP/liga.

**Monetização:** freemium. Grátis para sempre: lições + quiz + jogo (limite/dia). Pago: áudio-chat ilimitado + relatório semanal + jogo ilimitado.

---

## 2. Princípios de escopo (o que NÃO entra no MVP)

Para não estourar o prazo, está **fora**:

- ❌ Streak, XP global, leaderboard, ligas.
- ❌ ERRANT (correção fica 100% no LLM no MVP; ERRANT é "depois").
- ❌ Spaced repetition completo (apenas registrar `user_error`; algoritmo vem depois).
- ❌ Conteúdo de lição gerado on-demand (gera uma vez, revisa manualmente, serve estático).
- ❌ Chamada de voz ao vivo (Realtime API). Só áudio **assíncrono**.
- ❌ App nativo (iOS/Android). Só PWA.
- ❌ Múltiplos idiomas de aprendizado. Só **inglês**.

Regra de ouro: toda feature nova disputa espaço com o prazo. Se não é um dos 3 pilares + auth + pagamento, vai pro backlog pós-MVP.

---

## 3. Arquitetura (resumo)

```
┌─────────────┐     HTTPS      ┌──────────────┐
│  PWA (Vite) │ ─────────────> │  web (Express)│
│  Vercel     │ <───────────── │  Railway      │
└─────────────┘   SSE/polling  └──────┬───────┘
                                       │ enfileira job
                                       ▼
                                ┌──────────────┐   OpenAI/ElevenLabs
                                │ worker BullMQ │ ──────────────────>
                                │  Railway      │
                                └──┬────────┬──┘
                                   │        │
                              Postgres   Redis   + R2 (áudio) + Cloudflare (DNS/CDN)
                                (Railway) (Railway)
```

- **Chave de API só no back.** Nenhuma `VITE_` com segredo.
- **Áudio sempre no R2** (nunca Railway Volumes). URLs assinadas 5–15 min.
- **Pipeline pesado (STT→LLM→TTS) sempre na fila**, nunca no request HTTP.

Stack detalhada: ver `mvp-ingles-stack-tecnica.md`.

---

## 4. Roadmap por fases (~12 semanas)

Cada fase termina com um "Definition of Done" (DoD) verificável.

> **⚠️ Mudança de ordem (2026-10-06): prototype-first.** Em vez de "fundação primeiro", estamos atacando a **fatia vertical mais valiosa + mais arriscada** antes: a **Conversa (chat de áudio)**. O protótipo roda **síncrono, só com OpenAI** (Whisper + GPT-4o-mini + OpenAI TTS), **sem auth, sem banco, sem fila, sem R2** — áudio devolvido inline e trava de custo por conversa. Objetivo: validar cedo o risco do Whisper com sotaque BR, a latência e o custo real por troca. A lógica do pipeline está isolada em `apps/api/src/services/chat.ts`, então quando virar fila (BullMQ) + R2 + ElevenLabs, só muda o "encanamento". **Ordem nova:** Fase A (Chat) → Fase B (Jogo dinâmico) → depois backfill da fundação (auth → persistência → fila/R2/ElevenLabs → gating/pagamento → onboarding/lições). As fases numeradas abaixo seguem como referência de escopo de cada módulo.

### Fase A — Fatia vertical do Chat (EM ANDAMENTO) 🔥

- [x] Serviço de pipeline reutilizável (`services/chat.ts`): STT (Whisper) → LLM (GPT-4o-mini, structured output com correções em pt-BR) → TTS (OpenAI `tts-1`).
- [x] Personagens (`services/characters.ts`): barista NY + entrevistador, com voz por personagem.
- [x] Rota `POST /chat/message` (multipart) + `GET /chat/characters`; histórico em memória; **trava de custo** (`CHAT_MAX_TURNS`, padrão 20) → 429.
- [x] Front: página `Conversar` (gravação `MediaRecorder` com limite 60s, player, correções, limite de trocas).
- [x] **Tubulação validada ponta a ponta** com chave real (clipe TTS → Whisper → GPT-4o-mini → correções pt-BR → TTS). Whisper transcreveu 100%, correções corretas (verb_tense/word_choice/article), áudio retornado.
- [x] **Streaming (NDJSON) no `/chat/message`**: emite `user` (transcrição ~1s) → `reply` (texto+correções) → `reply_audio`. Front renderiza em etapas com indicador "digitando…". Latência percebida muito menor (transcrição aparece em ~1s vs. ~11s antes).
- [x] **Toggle "Corretor gramatical"** (ícone de config no header do chat): desligado, o personagem só conversa (`corrections: []`). Preferência salva em localStorage. Validado via API (on=3 correções, off=[]).
- [x] **Janela de chat fixa** (`ChatWindow`): header e controles fixos, scroll só na lista de mensagens (padrão de app de mensagem). Conferido no navegador.
- [x] **Cancelar gravação** (ícone de lixeira que aparece durante a gravação, descarta sem enviar) + botões de áudio menores para sobrar área de chat.
- [ ] **Falta o teste com voz real no navegador** (risco do sotaque BR) — só você consegue fazer, falando no microfone.
- [ ] Persistir conversa (quando entrar o Prisma) e migrar para fila + R2 + ElevenLabs na produtização.

### Fase B — Hub de jogos (EM ANDAMENTO) 🎮

Arquitetura pensada para **múltiplos jogos** (não acoplada ao balão).

- [x] **Contrato comum** `GameComponentProps` (`features/game/types.ts`): todo jogo recebe `challenges` + `onFinish`/`onExit`. Novo jogo = criar o componente + registrar no `registry.ts`.
- [x] **Fonte de desafios desacoplada**: `GET /game/challenges?level&count` gera questões **dinâmicas** por nível via GPT-4o-mini (structured output, explicação pt-BR). Serve qualquer jogo. Validado (A2, 3 questões, ~5.5s).
- [x] **Hub + Player genéricos** (`GamesHub`, `GamePlayer`): lista do catálogo, seletor de nível, loading/erro/placar — agnósticos de qual jogo é.
- [x] **Jogo do balão** como 1ª implementação isolada (`games/balloon/BalloonGame.tsx`): balões sobem, toque na resposta certa, placar, auto-avança, tela de fim. Testado no navegador (jogável por clique).
- [x] **Contrato generalizado**: `GameComponentProps = { level, onFinish, onExit }` — cada jogo carrega seus próprios dados; `GamePlayer` ficou agnóstico (só roda o jogo + tela de fim). `GameResult = { score, summary }` serve qualquer jogo.
- [x] **2º jogo — "Palavras do tema"** (`games/words/WordChainGame.tsx`): fale palavras do tema a cada 5s, sem repetir; acaba no tempo ou na repetição. Gênio (🧞 placeholder, trocar por ilustração depois) esperando. Backend `POST /game/word-check` (Whisper + LLM valida se é do tema). Validado: "potato"/cozinha → related; "football"/cozinha → não. UI (intro, timer, gênio, fim) conferida no navegador; **falta testar a voz** (mic bloqueado no painel embutido).
- [x] `useRecorder` movido para `src/hooks/` (compartilhado entre chat e jogos).
- [x] Cliente OpenAI extraído para `services/openaiClient.ts` (compartilhado entre chat e jogos).
- [ ] Gating do plano grátis (limite de rodadas/dia) — depois do auth.
- [ ] Puxar desafios do tópico que a pessoa estuda (quando houver profile/conteúdo CEFR-J); hoje é por nível escolhido.
- [ ] Cache dos desafios por nível (reduzir custo/latência) — opcional.

### Fase 0 — Setup & infra (Semana 1)

Objetivo: esqueleto rodando ponta a ponta com um "hello world" autenticável.

- [x] Monorepo com npm workspaces (`apps/api`, `apps/web`, `apps/worker`) — um deploy por serviço.
- [x] Back: Node 20 + Express + TS + Zod + Prisma. `GET /health` → 200 (verificado). `GET /health/db` degrada p/ 503 sem derrubar o processo.
- [x] Prisma: `schema.prisma` + client gerado (`prisma generate`). Falta `prisma migrate` (depende do Postgres).
- [x] Front: Vite + React + TS + Tailwind + PWA + base pronta para shadcn/ui (`components.json`, `cn`, tokens CSS). Home com os 3 botões + indicador de status da API.
- [ ] Railway: projeto com serviços `web`, `worker`, `postgres`, `redis`. *(infra — pendente de conta)*
- [ ] Vercel: deploy do front conectado ao git. *(infra — `vercel.json` já incluso)*
- [ ] Cloudflare: DNS + bucket R2 criado + credenciais S3. *(infra — pendente de conta)*
- [ ] Postgres: extensões `unaccent`, `pg_trgm` (já declaradas no `schema.prisma`), função `f_unaccent` (via migration quando houver banco).
- [x] `.env` fora do git (`.gitignore` + `.env.example` na raiz e por app).
- [ ] Sentry (front + back) e PostHog instalados (eventos virão depois).

**DoD:** deploy automático via git funcionando; front em produção fala com `/health` do back; banco migra com `prisma migrate`.
**Status:** esqueleto de código 100% pronto e buildando (API, worker e web). Resta a parte de **infra/contas** (Railway, Vercel, Cloudflare, Postgres, Sentry/PostHog).

### Fase 1 — Autenticação & perfil (Semana 2)

- [ ] `better-auth` no Express (email+senha + Google OAuth + magic link) usando o **adaptador Prisma** do better-auth.
- [ ] Tabelas `user`/`session`/`account`/`verification` migradas.
- [ ] Tabela `profile` (nível CEFR, objetivo, idioma nativo, plano) com FK → `user`.
- [ ] Telas: signup, login, logout, verificação de email.
- [ ] Estado global com Zustand (sessão do usuário).
- [ ] Guarda de rota no front (protegida vs pública).

**DoD:** criar conta, logar, deslogar e persistir sessão entre reloads.

### Fase 2 — Onboarding & Home (Semana 3)

- [ ] Onboarding 2 min: nome → objetivo (viagem/trabalho/estudo) → teste curto de posicionamento (A2/B1/B2).
- [ ] Lógica de posicionamento: ~8–12 questões que mapeiam pra nível CEFR inicial, grava em `profile`.
- [ ] Home com 3 botões grandes: **Aprender · Jogar · Conversar**.
- [ ] Mobile-first de verdade (desktop depois).

**DoD:** usuário novo completa onboarding, recebe nível e cai na Home.

### Fase 3 — Aprender (lições + quiz) (Semanas 4–5)

Primeiro pilar e o mais "commodity" — bom para firmar padrões de UI/dados.

- [ ] Importar **CEFR-J Grammar Profile** → `grammar_topic` (lista fechada, ordenada por nível).
- [ ] Gerar conteúdo das lições **uma vez** com LLM a partir do currículo → `grammar_lesson` (texto + exemplos). **Revisar manualmente.**
- [ ] Gerar ~10 questões por tópico → `grammar_question` (múltipla escolha).
- [ ] Tela lista de tópicos por nível; tela de lição (explicação curta) + quiz.
- [ ] `user_topic_progress`: marca completos + score.
- [ ] Erros do quiz gravam em `user_error` (para futuro spaced repetition).
- [ ] Barra de progresso "% do CEFR-J B1 dominado".
- [ ] Evento PostHog: `lesson_opened`, `quiz_completed`.

**DoD:** usuário percorre tópico → lição → quiz → progresso atualiza e aparece no Perfil.

### Fase 4 — Jogar (jogo do balão) (Semana 6)

- [ ] Mecânica do balão (React, sem física pesada; `requestAnimationFrame` ou CSS).
- [ ] Desafios puxados do tópico em estudo ou aleatório do nível (reusa `grammar_question`).
- [ ] `game_run`: registra cada partida.
- [ ] **Hard limit** de X rodadas/dia no plano grátis (gate de monetização).
- [ ] Evento PostHog: `game_started`, `game_finished`.

**DoD:** partida jogável ponta a ponta; limite diário aplicado para conta grátis.

### Fase 5 — Conversar (pipeline de áudio) (Semanas 7–9) ⚠️ núcleo de risco

Maior risco técnico e de custo. Reservar ~3 semanas.

- [ ] Personagens em `character` (ex.: barista NY, entrevistador) — 2–3 no MVP.
- [ ] `conversation` + `message` (texto, URL áudio, direção user/ai) + `correction`.
- [ ] Front: gravação com **MediaRecorder** (webm/opus), limite 60s/gravação.
- [ ] `POST /api/chat/message` (multipart) → salva no R2 → cria job BullMQ → responde 202 + `job_id`.
- [ ] Worker: **Whisper (STT)** → **GPT-4o-mini** (resposta + correção JSON `strict`) → **ElevenLabs (TTS)** → R2 → grava turno.
- [ ] Front recebe resultado via **SSE** (ou polling como fallback).
- [ ] Correção estruturada renderizada ("você falou X, mais natural seria Y").
- [ ] **Hard limit** de trocas/dia (grátis) e cota mensal (pago) desde o dia 1.
- [ ] Cache de áudio da IA no R2 (reusa frase idêntica).
- [ ] Fallbacks: retry exponencial OpenAI; TTS da OpenAI se ElevenLabs falhar.
- [ ] Consentimento LGPD explícito pra gravar áudio + caminho de exclusão.
- [ ] **Testar com áudio brasileiro real** (sotaque) antes de confiar no Whisper.
- [ ] Eventos PostHog: `audio_sent`, `conversation_started`.

**DoD:** ciclo completo gravar → transcrever → responder (áudio) → corrigir, dentro do orçamento de custo por troca (US$ 0,02–0,05) e com limites diários funcionando.

### Fase 6 — Monetização (Semana 10)

- [ ] **Mercado Pago** assinatura recorrente (Preapproval). Pix + cartão + boleto.
- [ ] Gate: grátis (lição/quiz ilimitados + jogo/áudio com limite) vs pago (áudio ilimitado c/ cota + relatório + jogo ilimitado).
- [ ] Campo `plano` em `profile` controla acesso; webhook do MP atualiza status.
- [ ] Preço inicial: **R$ 30–50/mês** com cota de ~120 min áudio-chat/mês.
- [ ] Relatório semanal de progresso (feature paga).
- [ ] Tela de assinatura + estados (ativo, cancelado, pagamento pendente).

**DoD:** assinar via Pix muda `plano` para pago e destrava o áudio ilimitado; cancelamento reverte.

### Fase 7 — Perfil, polimento & launch (Semanas 11–12)

- [ ] Perfil: nível CEFR, tópicos completos, erros frequentes, histórico de conversas.
- [ ] PWA: manifest, ícones, offline parcial (lições em cache), "instalar na tela inicial".
- [ ] Health checks, logs, alertas Sentry revisados.
- [ ] Dump semanal manual do Postgres pro R2 (backup de garantia).
- [ ] Revisão de todos os hard limits de custo.
- [ ] Teste de ponta a ponta nos 3 fluxos + onboarding + pagamento.
- [ ] Beta fechado com usuários reais; ajustes finais.

**DoD:** app instalável, 3 pilares funcionais, pagamento ativo, custos sob controle, monitoramento ligado.

---

## 5. Ordem de criação do schema

Para não travar: criar na ordem de dependência.

1. `user`, `session`, `account`, `verification` (better-auth) → **Fase 1**
2. `profile` → **Fase 1/2**
3. `grammar_topic` → `grammar_lesson` → `grammar_question` → **Fase 3**
4. `user_topic_progress`, `user_error` → **Fase 3**
5. `game_run` → **Fase 4**
6. `character` → `conversation` → `message` → `correction` → **Fase 5**
7. (sem tabela nova; `profile.plano` + log de webhook) → **Fase 6**

---

## 6. Riscos & mitigação (do próprio escopo)

| Risco | Mitigação | Fase |
|---|---|---|
| Áudio longo quebra UX | MediaRecorder limitado a 60s; divide se maior | 5 |
| Cold start do worker atrasa 1º áudio | Worker aquecido + "processando..." com estimativa | 5 |
| Latência do TTS | Streaming da 1ª frase assim que pronta (−50–70%) | 5 |
| Whisper erra sotaque BR | Testar com áudio brasileiro real antes de confiar | 5 |
| Rate limit OpenAI | Retry exponencial + fallback OpenAI TTS | 5 |
| **Custo descontrolado** | **Hard limit por usuário/dia desde o dia 1** | 4, 5 |
| Chave de API vazada | Tudo via back; nenhuma `VITE_` com segredo | 0 |
| LGPD do áudio | Consentimento explícito + retenção limitada + exclusão | 5 |
| Perda de dados | Dump semanal manual do Postgres → R2 | 7 |

---

## 7. Decisões em aberto (confirmar antes/no começo)

1. **Front: Vercel ou tudo no Railway?** Escopo sugere Vercel (grátis, PWA nativo). Railway serve estático e mantém uma conta só. → *recomendo Vercel pra começar.*
2. **Router:** TanStack Router vs React Router. → *React Router pra velocidade/familiaridade; TanStack se quiser type-safety de rota.*
3. **Estado:** Zustand vs `useContext`+`useReducer`. → *Zustand (o escopo já aponta).*
4. **Quantos personagens no MVP?** → *2–3 pra não inflar conteúdo/TTS.*
5. **LLM:** GPT-4o-mini vs Claude Haiku 4.5. → *começar com um só; ambos cabem no loop quente.*
6. **Monorepo vs repos separados** → *monorepo com workspaces (um deploy por serviço).*

---

## 8. Próximo passo concreto

Começar pela **Fase 0**: criar a estrutura do monorepo (`web` + `api`), subir `/health` e conectar Railway/Vercel. Quando você der o OK, eu gero o esqueleto do projeto (estrutura de pastas, `package.json`, config de Prisma/Zod/Express e o front Vite+Tailwind+shadcn).

> **Nota sobre a stack:** ORM é **Prisma** (já refletido em `mvp-ingles-stack-tecnica.md`). Pacotes: `prisma`/`@prisma/client`; migrations com `prisma migrate`; better-auth usa o **adaptador Prisma**. Trade-off: client gerado com DX madura e ótima para dev solo; ficar de olho no cold start do worker por causa do custo de inicialização do client.
