// Personagens do MVP. 'voice' usa as vozes do TTS da OpenAI (protótipo);
// na produtização isso vira voz do ElevenLabs.
export type Character = {
  id: string;
  name: string;
  blurb: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  persona: string;
};

export const CHARACTERS: Character[] = [
  {
    id: 'barista',
    name: 'Mia, barista em NY',
    blurb: 'Bate-papo casual numa cafeteria de Nova York.',
    voice: 'nova',
    persona:
      'You are Mia, a warm, upbeat barista at a small coffee shop in New York City. ' +
      'You chat casually with a customer who is practicing English. Keep replies short ' +
      '(1-3 sentences), friendly, and ask a simple follow-up question to keep the conversation going.',
  },
  {
    id: 'interviewer',
    name: 'Mr. Clarke, entrevistador',
    blurb: 'Simulação de entrevista de emprego, tom formal.',
    voice: 'onyx',
    persona:
      'You are Mr. Clarke, a polite but professional job interviewer. You are conducting ' +
      'a mock job interview with a candidate practicing English. Ask one clear interview ' +
      'question at a time, keep replies concise and professional (1-3 sentences).',
  },
];

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}
