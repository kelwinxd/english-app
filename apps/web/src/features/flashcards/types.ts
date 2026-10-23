// Espelha a futura tabela `srs_item` (Postgres). Hoje persiste em localStorage;
// quando o banco subir, só a camada de store muda — tipos e UI permanecem.

export type ItemType = 'word' | 'phrase' | 'grammar';
export type Source = 'manual' | 'chat_correction' | 'game_pick' | 'lesson_pick';

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  word: 'Palavra',
  phrase: 'Frase',
  grammar: 'Gramática',
};

export const SOURCE_LABEL: Record<Source, string> = {
  manual: 'Manual',
  chat_correction: 'Correção no chat',
  game_pick: 'Jogo',
  lesson_pick: 'Lição',
};

export type SrsItem = {
  id: string;
  content: string; // a palavra/frase/estrutura
  translation: string;
  example: string;
  context?: string; // contexto original (ex.: a frase corrigida no chat)
  itemType: ItemType;
  source: Source;
  tags: string[];
  // Estado do FSRS (datas em ISO)
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  learning_steps: number;
  state: number;
  last_review?: string | null;
  createdAt: string;
  deletedAt?: string | null; // soft delete
};

export type NewItemInput = {
  content: string;
  translation?: string;
  example?: string;
  context?: string;
  itemType?: ItemType;
  source?: Source;
  tags?: string[];
};
