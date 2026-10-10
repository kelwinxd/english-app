import OpenAI from 'openai';
import { env } from '../env.js';

// Cliente OpenAI compartilhado (singleton). Usado pelo chat e pelos jogos.
let client: OpenAI | null = null;

export function openaiReady(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

export function getOpenAI(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada');
  }
  client ??= new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}
