import { toFile } from 'openai';
import { getOpenAI } from './openaiClient.js';

export type WordCheck = { word: string; related: boolean };

const WORD_SCHEMA = {
  name: 'word_check',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      normalized: { type: 'string' },
      related: { type: 'boolean' },
    },
    required: ['normalized', 'related'],
  },
} as const;

/**
 * Jogo de encadear palavras: transcreve a palavra falada (Whisper) e decide,
 * via LLM, se ela é claramente relacionada ao tema. `normalized` é a palavra
 * em minúsculas (um termo só) para a checagem de repetição no front.
 */
export async function checkWord(
  audio: Buffer,
  mimeType: string,
  theme: string,
): Promise<WordCheck> {
  const api = getOpenAI();

  const file = await toFile(audio, 'word.webm', { type: mimeType });
  const stt = await api.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'en',
  });
  const spoken = stt.text.trim();

  const completion = await api.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You judge a word-association game. The player says one English word. ' +
          'Decide if it is clearly related to the given theme. ' +
          'Return "normalized": the main English word in lowercase (single word, no punctuation).',
      },
      { role: 'user', content: `Theme: "${theme}". The player said: "${spoken}". Is it related?` },
    ],
    response_format: { type: 'json_schema', json_schema: WORD_SCHEMA },
    temperature: 0,
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}') as {
    normalized?: string;
    related?: boolean;
  };

  return {
    word: (parsed.normalized || spoken).toLowerCase().trim(),
    related: Boolean(parsed.related),
  };
}
