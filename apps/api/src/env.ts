import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  // Opcional na Fase 0: a API sobe e /health responde mesmo sem banco.
  DATABASE_URL: z.string().url().optional(),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  // Chat (fatia vertical). Opcional para a API subir; a rota /chat retorna 503 se faltar.
  OPENAI_API_KEY: z.string().min(1).optional(),
  // Trava de custo: máximo de trocas por conversa no protótipo.
  CHAT_MAX_TURNS: z.coerce.number().int().positive().default(20),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('[api] variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
