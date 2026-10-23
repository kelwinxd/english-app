import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';
import type { NewItemInput, SrsItem } from './types';

// Pool único de SRS no localStorage (depois migra para a tabela srs_item).
const KEY = 'englishapp:srs';
const f = fsrs();

export { Rating };
export type { Grade };

function read(): SrsItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as SrsItem[];
  } catch {
    return [];
  }
}

function write(items: SrsItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* localStorage pode estar indisponível */
  }
}

function cardToFields(card: Card) {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    learning_steps: card.learning_steps,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
}

function fieldsToCard(i: SrsItem): Card {
  return {
    due: new Date(i.due),
    stability: i.stability,
    difficulty: i.difficulty,
    elapsed_days: i.elapsed_days,
    scheduled_days: i.scheduled_days,
    reps: i.reps,
    lapses: i.lapses,
    learning_steps: i.learning_steps,
    state: i.state,
    last_review: i.last_review ? new Date(i.last_review) : undefined,
  } as Card;
}

/** Itens ativos (sem soft delete). */
export function listItems(): SrsItem[] {
  return read().filter((i) => !i.deletedAt);
}

/** Itens vencidos (due <= agora), ordenados por vencimento. */
export function dueItems(now = new Date()): SrsItem[] {
  const t = now.getTime();
  return listItems()
    .filter((i) => new Date(i.due).getTime() <= t)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
}

export function addItem(input: NewItemInput): SrsItem {
  const card = createEmptyCard(new Date()); // novo item já nasce "due" agora
  const item: SrsItem = {
    id: crypto.randomUUID(),
    content: input.content.trim(),
    translation: (input.translation ?? '').trim(),
    example: (input.example ?? '').trim(),
    context: input.context?.trim() || undefined,
    itemType: input.itemType ?? 'word',
    source: input.source ?? 'manual',
    tags: (input.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    ...cardToFields(card),
    createdAt: new Date().toISOString(),
    deletedAt: null,
  };
  write([item, ...read()]);
  return item;
}

export function updateItem(id: string, patch: Partial<SrsItem>) {
  write(read().map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function softDelete(id: string) {
  updateItem(id, { deletedAt: new Date().toISOString() });
}

/** Aplica uma nota (Again/Hard/Good/Easy) e reagenda via FSRS. */
export function gradeItem(id: string, rating: Grade) {
  const items = read();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const record = f.repeat(fieldsToCard(items[idx]), new Date());
  items[idx] = { ...items[idx], ...cardToFields(record[rating].card) };
  write(items);
}

/** Rótulo "próxima revisão" a partir do due. */
export function dueLabel(dueISO: string, now = new Date()): string {
  const diff = new Date(dueISO).getTime() - now.getTime();
  const day = 86_400_000;
  if (diff <= 0) return 'revisar agora';
  if (diff < day) return `em ${Math.max(1, Math.round(diff / 3_600_000))}h`;
  const days = Math.round(diff / day);
  return days === 1 ? 'em 1 dia' : `em ${days} dias`;
}

export const RATING_LABELS: { grade: Grade; label: string; className: string }[] = [
  { grade: Rating.Again, label: 'De novo', className: 'bg-destructive text-white' },
  { grade: Rating.Hard, label: 'Difícil', className: 'bg-amber-500 text-white' },
  { grade: Rating.Good, label: 'Bom', className: 'bg-emerald-500 text-white' },
  { grade: Rating.Easy, label: 'Fácil', className: 'bg-sky-500 text-white' },
];
