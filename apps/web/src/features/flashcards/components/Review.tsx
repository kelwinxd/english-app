import { useState } from 'react';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dueItems, gradeItem, RATING_LABELS, type Grade } from '../store';
import { ITEM_TYPE_LABEL, type SrsItem } from '../types';

export function Review({ onDone }: { onDone: () => void }) {
  const [queue] = useState<SrsItem[]>(() => dueItems()); // snapshot do início
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function grade(g: Grade) {
    gradeItem(queue[idx].id, g);
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  const done = queue.length === 0 || idx >= queue.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Minhas palavras
        </button>
        {!done && (
          <span className="text-muted-foreground">
            {idx + 1}/{queue.length}
          </span>
        )}
      </div>

      {done ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 text-lg font-semibold">
            {queue.length === 0 ? 'Nada para revisar agora.' : 'Revisão concluída!'}
          </p>
          {queue.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {queue.length} carta{queue.length === 1 ? '' : 's'} revisada{queue.length === 1 ? '' : 's'}.
            </p>
          )}
          <button
            type="button"
            onClick={onDone}
            className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Voltar
          </button>
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <FlipCard item={queue[idx]} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          </div>

          {flipped ? (
            <div className="grid shrink-0 grid-cols-4 gap-2">
              {RATING_LABELS.map((r) => (
                <button
                  key={r.grade}
                  type="button"
                  onClick={() => grade(r.grade)}
                  className={cn('rounded-lg px-2 py-2.5 text-sm font-medium', r.className)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="shrink-0 text-center text-xs text-muted-foreground">
              Toque na carta para ver a resposta
            </p>
          )}
        </>
      )}
    </div>
  );
}

function FlipCard({
  item,
  flipped,
  onFlip,
}: {
  item: SrsItem;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="h-72 w-full max-w-xs [perspective:1200px]"
      aria-label="Virar carta"
    >
      <div
        className={cn(
          'relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        {/* Frente */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 p-6 text-center text-white shadow-xl [backface-visibility:hidden]">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs">
            {ITEM_TYPE_LABEL[item.itemType]}
          </span>
          <p className="text-3xl font-bold">{item.content}</p>
          <span className="absolute bottom-4 flex items-center gap-1 text-xs text-white/70">
            <RotateCw className="h-3 w-3" /> tocar para virar
          </span>
        </div>

        {/* Verso */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border bg-card p-6 text-center shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {item.translation && <p className="text-2xl font-semibold text-primary">{item.translation}</p>}
          {item.example && (
            <p className="text-sm italic text-muted-foreground">“{item.example}”</p>
          )}
          {item.context && (
            <p className="mt-1 text-xs text-muted-foreground">Contexto: {item.context}</p>
          )}
          {item.tags.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">{item.tags.map((t) => `#${t}`).join(' ')}</p>
          )}
        </div>
      </div>
    </button>
  );
}
