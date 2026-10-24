import { apiGet, apiPost, apiPostFormStream, apiPostJsonStream } from '@/lib/api';
import type { CharactersResponse, ChatStreamEvent } from '../types';

/** TTS avulso: lê uma frase pronta na voz do personagem. Retorna data URL mp3. */
export function speakText(params: { characterId: string; text: string }): Promise<{ audio: string }> {
  return apiPost<{ audio: string }>('/chat/tts', params);
}

// Única porta de entrada para a API do chat. As pages não chamam fetch;
// tudo passa por aqui (e por baixo, pelos helpers genéricos de @/lib/api).

export function fetchCharacters(): Promise<CharactersResponse> {
  return apiGet<CharactersResponse>('/chat/characters');
}

/** Envia o áudio e recebe a resposta em streaming (etapa por etapa). */
export function sendMessageStream(
  params: {
    audio: Blob;
    conversationId: string;
    characterId: string;
    correctGrammar: boolean;
  },
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const form = new FormData();
  form.append('audio', params.audio, 'speech.webm');
  form.append('conversationId', params.conversationId);
  form.append('characterId', params.characterId);
  form.append('correctGrammar', String(params.correctGrammar));
  return apiPostFormStream<ChatStreamEvent>('/chat/message', form, onEvent);
}

/** Envia uma mensagem de TEXTO e recebe a resposta em streaming. */
export function sendMessageTextStream(
  params: {
    text: string;
    conversationId: string;
    characterId: string;
    correctGrammar: boolean;
  },
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  return apiPostJsonStream<ChatStreamEvent>('/chat/message-text', params, onEvent);
}
