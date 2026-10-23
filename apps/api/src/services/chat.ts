import { toFile } from 'openai';
import type { Character } from './characters.js';
import { getOpenAI, openaiReady } from './openaiClient.js';

// ---------------------------------------------------------------------------
// Pipeline de uma troca de mensagem. Esta é a parte que PERMANECE quando o
// transporte mudar (síncrono -> fila BullMQ) e o storage virar R2. Só recebe
// bytes de áudio + histórico e devolve texto + correção + áudio da resposta.
// ---------------------------------------------------------------------------

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type Correction = {
  original: string;
  corrected: string;
  type: string;
  explanation: string;
};

export type TurnResult = {
  userText: string;
  replyText: string;
  corrections: Correction[];
  replyAudioBase64: string; // mp3 em base64 (protótipo: inline na resposta)
};

export function chatReady(): boolean {
  return openaiReady();
}

// Extensão que o Whisper usa pra detectar o formato do áudio.
function extFromMime(mime: string): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  return 'webm';
}

// Structured output: resposta do personagem + correções do que o usuário falou.
const RESPONSE_SCHEMA = {
  name: 'tutor_turn',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      character_reply: { type: 'string' },
      corrections: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            original: { type: 'string' },
            corrected: { type: 'string' },
            type: { type: 'string' },
            explanation: { type: 'string' },
          },
          required: ['original', 'corrected', 'type', 'explanation'],
        },
      },
    },
    required: ['character_reply', 'corrections'],
  },
} as const;

type TurnParams = {
  character: Character;
  history: ChatMessage[];
  // Quando false, o personagem só conversa — sem corrigir gramática.
  correctGrammar?: boolean;
  // Callbacks por etapa: a rota emite eventos de streaming conforme cada parte fica pronta.
  onUserText?: (userText: string) => void | Promise<void>;
  onReply?: (replyText: string, corrections: Correction[]) => void | Promise<void>;
};

/** Troca por ÁUDIO: transcreve (Whisper) e segue o pipeline. */
export async function processTurn(
  params: TurnParams & { audio: Buffer; mimeType: string },
): Promise<TurnResult> {
  const api = getOpenAI();

  // 1. STT — Whisper. language 'en' porque o alvo é prática de inglês.
  const file = await toFile(params.audio, `audio.${extFromMime(params.mimeType)}`, {
    type: params.mimeType,
  });
  const stt = await api.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'en',
  });
  const userText = stt.text.trim();
  await params.onUserText?.(userText);

  return respond(userText, params);
}

/** Troca por TEXTO: usa a mensagem digitada direto (sem Whisper). */
export async function processTextTurn(
  params: TurnParams & { text: string },
): Promise<TurnResult> {
  const userText = params.text.trim();
  await params.onUserText?.(userText);
  return respond(userText, params);
}

/** LLM (resposta + correções) + TTS. Compartilhado por áudio e texto. */
async function respond(userText: string, params: TurnParams): Promise<TurnResult> {
  const api = getOpenAI();

  const correctGrammar = params.correctGrammar ?? true;
  const systemPrompt = correctGrammar
    ? `${params.character.persona}\n\n` +
      'Also act as an English tutor. In "corrections", list concrete grammar/word-choice ' +
      "mistakes in the user's LAST message only. Keep corrections empty if the sentence was fine. " +
      'IMPORTANT: ignore punctuation entirely — never correct commas, periods or other ' +
      'punctuation, and never add a correction that only changes punctuation. ' +
      'Write each "explanation" in Brazilian Portuguese (pt-BR), short and clear. ' +
      '"type" is a short English slug like "verb_tense", "article", "preposition", "word_choice".'
    : `${params.character.persona}\n\n` +
      'Just have a natural conversation. Do NOT correct the user. ' +
      'Always return an empty "corrections" array.';

  const completion = await api.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...params.history,
      { role: 'user', content: userText },
    ],
    response_format: { type: 'json_schema', json_schema: RESPONSE_SCHEMA },
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as { character_reply: string; corrections: Correction[] };
  const replyText = parsed.character_reply;
  const corrections = correctGrammar ? parsed.corrections ?? [] : [];
  await params.onReply?.(replyText, corrections);

  // TTS — OpenAI tts-1 (protótipo; ElevenLabs entra na produtização).
  const speech = await api.audio.speech.create({
    model: 'tts-1',
    voice: params.character.voice,
    input: replyText,
  });
  const replyAudioBase64 = Buffer.from(await speech.arrayBuffer()).toString('base64');

  return { userText, replyText, corrections, replyAudioBase64 };
}
