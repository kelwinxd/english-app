import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { env } from '../env.js';
import { CHARACTERS, getCharacter } from '../services/characters.js';
import {
  chatReady,
  processTextTurn,
  processTurn,
  type ChatMessage,
  type Correction,
  type TurnResult,
} from '../services/chat.js';
import type { Response } from 'express';

export const chatRouter = Router();

// Protótipo: áudio em memória, limite 60s já é garantido no front; aqui cap de 25MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Estado em memória do protótipo (sem banco ainda). conversationId vem do front.
type ConvState = { turns: number; history: ChatMessage[] };
const conversations = new Map<string, ConvState>();

chatRouter.get('/characters', (_req, res) => {
  res.json({
    ready: chatReady(),
    maxTurns: env.CHAT_MAX_TURNS,
    characters: CHARACTERS.map(({ id, name, blurb }) => ({ id, name, blurb })),
  });
});

const bodySchema = z.object({
  conversationId: z.string().min(1),
  characterId: z.string().min(1),
  // multipart envia string; default "true".
  correctGrammar: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v !== 'false'),
});

chatRouter.post('/message', upload.single('audio'), async (req, res) => {
  if (!chatReady()) {
    return res.status(503).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'conversationId e characterId são obrigatórios.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Áudio ausente (campo "audio").' });
  }

  const character = getCharacter(parsed.data.characterId);
  if (!character) {
    return res.status(400).json({ error: 'Personagem inválido.' });
  }

  const state = conversations.get(parsed.data.conversationId) ?? { turns: 0, history: [] };

  // Trava de custo: teto de trocas por conversa.
  if (state.turns >= env.CHAT_MAX_TURNS) {
    return res.status(429).json({
      error: `Limite de ${env.CHAT_MAX_TURNS} trocas desta conversa atingido (trava de custo do protótipo).`,
    });
  }

  await streamTurn(res, parsed.data.conversationId, state, (cb) =>
    processTurn({
      audio: req.file!.buffer,
      mimeType: req.file!.mimetype || 'audio/webm',
      character,
      history: state.history,
      correctGrammar: parsed.data.correctGrammar,
      ...cb,
    }),
  );
});

const textBodySchema = z.object({
  conversationId: z.string().min(1),
  characterId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
  correctGrammar: z.boolean().optional().default(true),
});

// Chat por TEXTO (JSON): mesma pipeline, sem Whisper.
chatRouter.post('/message-text', async (req, res) => {
  if (!chatReady()) {
    return res.status(503).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });
  }

  const parsed = textBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'conversationId, characterId e text são obrigatórios.' });
  }

  const character = getCharacter(parsed.data.characterId);
  if (!character) {
    return res.status(400).json({ error: 'Personagem inválido.' });
  }

  const state = conversations.get(parsed.data.conversationId) ?? { turns: 0, history: [] };
  if (state.turns >= env.CHAT_MAX_TURNS) {
    return res.status(429).json({
      error: `Limite de ${env.CHAT_MAX_TURNS} trocas desta conversa atingido (trava de custo do protótipo).`,
    });
  }

  await streamTurn(res, parsed.data.conversationId, state, (cb) =>
    processTextTurn({
      text: parsed.data.text,
      character,
      history: state.history,
      correctGrammar: parsed.data.correctGrammar,
      ...cb,
    }),
  );
});

type StreamCallbacks = {
  onUserText: (userText: string) => void;
  onReply: (replyText: string, corrections: Correction[]) => void;
};

// Streaming NDJSON compartilhado (áudio e texto): emite cada etapa, grava o
// histórico e aplica a trava de custo.
async function streamTurn(
  res: Response,
  conversationId: string,
  state: ConvState,
  run: (cb: StreamCallbacks) => Promise<TurnResult>,
) {
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no'); // evita buffering em proxy
  res.flushHeaders?.();
  const send = (obj: unknown) => res.write(`${JSON.stringify(obj)}\n`);

  try {
    const result = await run({
      onUserText: (userText) => send({ type: 'user', userText }),
      onReply: (replyText, corrections) => send({ type: 'reply', replyText, corrections }),
    });

    send({ type: 'reply_audio', replyAudio: `data:audio/mp3;base64,${result.replyAudioBase64}` });

    state.turns += 1;
    state.history.push(
      { role: 'user', content: result.userText },
      { role: 'assistant', content: result.replyText },
    );
    conversations.set(conversationId, state);

    send({ type: 'turns', turnsUsed: state.turns, turnsMax: env.CHAT_MAX_TURNS });
    res.end();
  } catch (err) {
    console.error('[chat] erro no pipeline:', err);
    send({
      type: 'error',
      error: 'Falha ao processar a mensagem.',
      detail: err instanceof Error ? err.message : String(err),
    });
    res.end();
  }
}
