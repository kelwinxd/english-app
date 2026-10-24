import { env } from '../env.js';
import { MemoryConversationStore } from './memory/conversationStore.js';
import type { Persistence } from './types.js';

export type { ConversationState, ConversationStore, Persistence } from './types.js';

// ---------------------------------------------------------------------------
// Composition root da persistência. É o ÚNICO arquivo que conhece os adapters
// concretos. Para migrar de memória para Postgres no futuro:
//   1. Adicione os models (conversation/message) no schema.prisma e migre.
//   2. Crie um PrismaConversationStore implementando ConversationStore.
//   3. Selecione-o aqui quando env.DATABASE_URL existir.
// As rotas/services não mudam, pois dependem só das interfaces em ./types.
// ---------------------------------------------------------------------------

let instance: Persistence | null = null;

export function getPersistence(): Persistence {
  if (instance) return instance;

  if (env.DATABASE_URL) {
    // Placeholder consciente: o schema ainda não tem as tabelas do chat, então
    // seguimos em memória mesmo com DATABASE_URL setado. Troque aqui quando os
    // adapters Prisma existirem.
    console.warn(
      '[persistence] DATABASE_URL definido, mas os adapters de banco ainda não existem — usando memória.',
    );
  }

  instance = {
    conversations: new MemoryConversationStore(),
  };
  return instance;
}
