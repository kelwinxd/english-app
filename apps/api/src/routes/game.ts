import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { openaiReady } from '../services/openaiClient.js';
import { generateChallenges } from '../services/challenges.js';
import { checkWord } from '../services/words.js';

export const gameRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const querySchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
  count: z.coerce.number().int().min(3).max(15).default(10),
});

// Fonte de desafios compartilhada por todos os jogos.
gameRouter.get('/challenges', async (req, res) => {
  if (!openaiReady()) {
    return res.status(503).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parâmetros inválidos (level, count).' });
  }

  try {
    const challenges = await generateChallenges(parsed.data.level, parsed.data.count);
    return res.json({ level: parsed.data.level, challenges });
  } catch (err) {
    console.error('[game] erro ao gerar desafios:', err);
    return res.status(502).json({
      error: 'Falha ao gerar desafios.',
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

// Jogo de encadear palavras: valida uma palavra falada contra o tema.
gameRouter.post('/word-check', upload.single('audio'), async (req, res) => {
  if (!openaiReady()) {
    return res.status(503).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });
  }
  const theme = typeof req.body.theme === 'string' ? req.body.theme.trim() : '';
  if (!theme) return res.status(400).json({ error: 'Tema ausente.' });
  if (!req.file) return res.status(400).json({ error: 'Áudio ausente (campo "audio").' });

  try {
    const result = await checkWord(req.file.buffer, req.file.mimetype || 'audio/webm', theme);
    return res.json(result);
  } catch (err) {
    console.error('[game] erro no word-check:', err);
    return res.status(502).json({
      error: 'Falha ao processar a palavra.',
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
