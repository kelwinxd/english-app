import { getOpenAI } from './openaiClient.js';

// Desafio genérico de múltipla escolha — serve para QUALQUER jogo.
// O jogo decide como apresentar (balão, cartas, etc.); a fonte é a mesma.
export type GameChallenge = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

const SCHEMA = {
  name: 'challenges',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      challenges: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            prompt: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } },
            answerIndex: { type: 'integer' },
            explanation: { type: 'string' },
          },
          required: ['prompt', 'options', 'answerIndex', 'explanation'],
        },
      },
    },
    required: ['challenges'],
  },
} as const;

/** Gera `count` questões de inglês no nível CEFR pedido (dinâmico via LLM). */
export async function generateChallenges(level: string, count: number): Promise<GameChallenge[]> {
  const api = getOpenAI();

  const completion = await api.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          `You create English grammar/vocabulary practice questions at CEFR level ${level}. ` +
          'Each question has: a short "prompt" (a sentence with a blank "___" or a short question), ' +
          'EXACTLY 4 distinct "options", and "answerIndex" = the 0-based index of the correct option. ' +
          '"explanation" is ONE short sentence in Brazilian Portuguese (pt-BR). ' +
          'Vary the grammar topics and avoid repeating questions.',
      },
      { role: 'user', content: `Generate ${count} questions.` },
    ],
    response_format: { type: 'json_schema', json_schema: SCHEMA },
    temperature: 0.8,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as { challenges: Omit<GameChallenge, 'id'>[] };

  // Mantém só questões bem-formadas (4 opções, índice válido).
  return parsed.challenges
    .filter((c) => c.options.length === 4 && c.answerIndex >= 0 && c.answerIndex < 4)
    .map((c, i) => ({ id: `c${i}`, ...c }));
}
