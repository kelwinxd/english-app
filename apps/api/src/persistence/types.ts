import type { ChatMessage } from '../services/chat.js';

// ---------------------------------------------------------------------------
// Portas de persistência (interfaces). As rotas e services dependem SÓ destas
// interfaces — nunca de um banco concreto. Hoje os adapters são em memória;
// quando entrar Postgres/Prisma, basta criar adapters que implementem estas
// mesmas interfaces e trocá-los no composition root (./index.ts). Nenhuma rota
// muda. É isto que deixa o banco desacoplado e substituível.
// ---------------------------------------------------------------------------

/** Estado de uma conversa do chat (contador de trocas + histórico). */
export type ConversationState = { turns: number; history: ChatMessage[] };

/** Repositório de conversas do chat. */
export interface ConversationStore {
  get(id: string): Promise<ConversationState | null>;
  save(id: string, state: ConversationState): Promise<void>;
}

/**
 * Container de persistência: ponto ÚNICO onde os adapters são escolhidos.
 * Cresce conforme novas tabelas saem do localStorage para o servidor
 * (ex.: users, srsItems, progress) — cada uma com sua própria porta aqui.
 */
export interface Persistence {
  conversations: ConversationStore;
}
