import { Router } from 'express';
import { z } from 'zod';
import { openaiReady } from '../services/openaiClient.js';
import { suggestItem } from '../services/srs.js';

export const srsRouter = Router();

const suggestSchema = z.object({ content: z.string().trim().min(1).max(120) });

// Sugestão da IA para um flashcard (tradução + exemplo + tags).
srsRouter.post('/suggest', async (req, res) => {
  if (!openaiReady()) {
    return res.status(503).json({ error: 'OPENAI_API_KEY não configurada no servidor.' });
  }
  const parsed = suggestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Termo inválido.' });
  }
  try {
    const suggestion = await suggestItem(parsed.data.content);
    return res.json(suggestion);
  } catch (err) {
    console.error('[srs] suggest erro:', err);
    return res.status(502).json({
      error: 'Falha ao gerar sugestão.',
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
