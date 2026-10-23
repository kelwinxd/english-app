import { apiPost } from '@/lib/api';

export type Suggestion = { translation: string; example: string; tags: string[] };

/** Sugestão da IA: preenche tradução, exemplo e tags de um termo. */
export function suggestItem(content: string): Promise<Suggestion> {
  return apiPost<Suggestion>('/srs/suggest', { content });
}
