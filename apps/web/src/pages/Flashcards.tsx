import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  MyWords,
  ItemForm,
  Review,
  listItems,
  dueItems,
  softDelete,
  type SrsItem,
} from '@/features/flashcards';

type View = 'list' | 'form' | 'review';

export function Flashcards() {
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<SrsItem | null>(null);
  const [items, setItems] = useState(listItems);

  const reload = () => setItems(listItems());
  const due = useMemo(() => dueItems().length, [items]);

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col px-4 py-4">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Início
      </Link>

      {view === 'list' && (
        <MyWords
          items={items}
          dueCount={due}
          onAdd={() => {
            setEditing(null);
            setView('form');
          }}
          onEdit={(it) => {
            setEditing(it);
            setView('form');
          }}
          onDelete={(id) => {
            softDelete(id);
            reload();
          }}
          onReview={() => setView('review')}
        />
      )}

      {view === 'form' && (
        <ItemForm
          initial={editing}
          onSaved={() => {
            reload();
            setView('list');
          }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'review' && (
        <Review
          onDone={() => {
            reload();
            setView('list');
          }}
        />
      )}
    </main>
  );
}
