import { apiGet, apiPost, apiPostForm } from '@/lib/api';
import type { Challenge, Level } from '../types';

type ChallengesResponse = { level: Level; challenges: Challenge[] };

/** Busca desafios gerados dinamicamente para um nível. Comum a todos os jogos. */
export function fetchChallenges(level: Level, count = 10): Promise<ChallengesResponse> {
  return apiGet<ChallengesResponse>(`/game/challenges?level=${level}&count=${count}`);
}

export type WordCheck = { word: string; related: boolean };

/** Valida uma palavra falada contra o tema (jogo de encadear palavras). */
export function checkWord(params: { audio: Blob; theme: string }): Promise<WordCheck> {
  const form = new FormData();
  form.append('audio', params.audio, 'word.webm');
  form.append('theme', params.theme);
  return apiPostForm<WordCheck>('/game/word-check', form);
}


export function checkTextWord(params: {
  text: string;
  theme: string;
}): Promise<WordCheck> {
  return apiPost<WordCheck>('/game/word-check-text', params);
}


