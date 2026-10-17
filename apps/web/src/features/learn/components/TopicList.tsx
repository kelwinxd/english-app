import { Check, Circle } from 'lucide-react';
import type { Topic } from '../data';

/** Lista reutilizável de tópicos (serve para Lições e Testes). */
export function TopicList({
  title,
  subtitle,
  topics,
  completed,
  badge,
  onSelect,
  onBack,
}: {
  title: string;
  subtitle: string;
  topics: Topic[];
  completed: (t: Topic) => boolean;
  badge?: (t: Topic) => string | null;
  onSelect: (t: Topic) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        ← Aprender
      </button>

      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {topics.map((t) => {
          const done = completed(t);
          const right = badge?.(t) ?? null;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
            >
              <span
                className={
                  done
                    ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-600'
                    : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'
                }
              >
                {done ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">{t.level}</span>
                  <span className="truncate font-semibold">{t.title}</span>
                </span>
                <span className="truncate text-sm text-muted-foreground">{t.summary}</span>
              </span>
              {right && <span className="shrink-0 text-xs text-muted-foreground">{right}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
