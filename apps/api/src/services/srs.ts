import { getOpenAI } from './openaiClient.js';

export type SrsSuggestion = { translation: string; example: string; tags: string[] };

const SUGGEST_SCHEMA = {
  name: 'srs_suggestion',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      translation: { type: 'string' },
      example: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
    },
    required: ['translation', 'example', 'tags'],
  },
} as const;

/** Preenche tradução, exemplo e tags para um termo em inglês (sugestão da IA). */
export async function suggestItem(content: string): Promise<SrsSuggestion> {
  const api = getOpenAI();

  const completion = await api.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You help a Brazilian learner build English flashcards. Given an English word or ' +
          'phrase, return: "translation" (a short pt-BR translation), "example" (one natural ' +
          'English sentence using the term), and "tags" (2-4 short lowercase tags: grammatical ' +
          'category and/or topic, e.g., "noun", "food", "phrasal verb").',
      },
      { role: 'user', content: `Term: "${content}"` },
    ],
    response_format: { type: 'json_schema', json_schema: SUGGEST_SCHEMA },
    temperature: 0.5,
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}') as Partial<SrsSuggestion>;
  return {
    translation: parsed.translation ?? '',
    example: parsed.example ?? '',
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
  };
}
