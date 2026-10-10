export type Character = { id: string; name: string; blurb: string };

export type CharactersResponse = {
  ready: boolean;
  maxTurns: number;
  characters: Character[];
};

export type Correction = {
  original: string;
  corrected: string;
  type: string;
  explanation: string;
};

export type TurnResponse = {
  userText: string;
  replyText: string;
  corrections: Correction[];
  replyAudio: string;
  turnsUsed: number;
  turnsMax: number;
};

export type Entry =
  | { role: 'user'; text: string; corrections: Correction[] }
  | { role: 'ai'; text: string; audio: string };

// Eventos emitidos pelo /chat/message em streaming (NDJSON).
export type ChatStreamEvent =
  | { type: 'user'; userText: string }
  | { type: 'reply'; replyText: string; corrections: Correction[] }
  | { type: 'reply_audio'; replyAudio: string }
  | { type: 'turns'; turnsUsed: number; turnsMax: number }
  | { type: 'error'; error: string; detail?: string };

// Etapa atual do turno em andamento, para feedback de UI.
export type Stage = 'idle' | 'stt' | 'thinking' | 'tts';
