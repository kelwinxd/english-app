import type { ConversationState, ConversationStore } from '../types.js';

/**
 * Adapter em memória do repositório de conversas. Protótipo: o estado vive no
 * processo e some ao reiniciar. A interface é assíncrona de propósito, para que
 * um adapter de banco (Prisma) entre no lugar sem mudar quem consome.
 */
export class MemoryConversationStore implements ConversationStore {
  private readonly rows = new Map<string, ConversationState>();

  async get(id: string): Promise<ConversationState | null> {
    return this.rows.get(id) ?? null;
  }

  async save(id: string, state: ConversationState): Promise<void> {
    this.rows.set(id, state);
  }
}
