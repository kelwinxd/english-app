import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dueLabel } from '../store';
import { ITEM_TYPE_LABEL, SOURCE_LABEL, type Source, type SrsItem } from '../types';

type Tab = 'all' | 'source' | 'tags';

export function MyWords({
  items,
  dueCount,
  onAdd,
  onEdit,
  onDelete,
  onReview,
}: {
  items: SrsItem[];
  dueCount: number;
  onAdd: () => void;
  onEdit: (item: SrsItem) => void;
  onDelete: (id: string) => void;
  onReview: () => void;
}) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(
    () => [...new Set(items.flatMap((i) => i.tags))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      const matchesQ =
        !needle ||
        i.content.toLowerCase().includes(needle) ||
        i.translation.toLowerCase().includes(needle) ||
        i.tags.some((t) => t.includes(needle));
      const matchesTag = tab !== 'tags' || !tagFilter || i.tags.includes(tagFilter);
      return matchesQ && matchesTag;
    });
  }, [items, q, tab, tagFilter]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas palavras</h1>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Adicionar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onReview}
        disabled={dueCount === 0}
        className="mb-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {dueCount > 0 ? `Revisar hoje (${dueCount})` : 'Nada para revisar agora'}
      </button>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar…"
        className="mb-2 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="mb-2 flex gap-2 text-sm">
        {(['all', 'source', 'tags'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-lg border px-3 py-1 transition-colors',
              tab === t ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
            )}
          >
            {t === 'all' ? 'Todas' : t === 'source' ? 'Por fonte' : 'Tags'}
          </button>
        ))}
      </div>

      {tab === 'tags' && allTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {allTags.map((tg) => (
            <button
              key={tg}
              type="button"
              onClick={() => setTagFilter(tagFilter === tg ? null : tg)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs',
                tagFilter === tg ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {tg}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Nenhum flashcard ainda. Toque em <strong>+</strong> para adicionar.
          </p>
        ) : tab === 'source' ? (
          <SourceGroups items={filtered} onEdit={onEdit} onDelete={onDelete} />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((i) => (
              <Card key={i.id} item={i} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceGroups({
  items,
  onEdit,
  onDelete,
}: {
  items: SrsItem[];
  onEdit: (i: SrsItem) => void;
  onDelete: (id: string) => void;
}) {
  const sources = [...new Set(items.map((i) => i.source))] as Source[];
  return (
    <div className="flex flex-col gap-4">
      {sources.map((s) => (
        <div key={s}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {SOURCE_LABEL[s]}
          </p>
          <div className="flex flex-col gap-2">
            {items
              .filter((i) => i.source === s)
              .map((i) => (
                <Card key={i.id} item={i} onEdit={onEdit} onDelete={onDelete} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({
  item,
  onEdit,
  onDelete,
}: {
  item: SrsItem;
  onEdit: (i: SrsItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{item.content}</span>
            <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">
              {ITEM_TYPE_LABEL[item.itemType]}
            </span>
          </div>
          {item.translation && <p className="text-sm text-muted-foreground">{item.translation}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label="Editar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="Apagar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {item.context && <p className="mt-1 text-xs text-muted-foreground">Contexto: {item.context}</p>}
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Próxima: {dueLabel(item.due)}</span>
        {item.tags.length > 0 && <span>· {item.tags.map((t) => `#${t}`).join(' ')}</span>}
      </div>
    </div>
  );
}
