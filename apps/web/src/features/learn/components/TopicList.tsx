import { BookOpen, Check } from 'lucide-react';
import type { Topic } from '../data';
import type { LearnProgress } from '../progress';

export function TopicList({
  topics,
  progress,
  onSelect,
}: {
  topics: Topic[];
  progress: LearnProgress;
  onSelect: (t: Topic) => void;
}) {
  const mastered = topics.filter((t) => (progress[t.id] ?? -1) === t.questions.length).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <h1 className="mb-1 text-2xl font-bold">Aprender</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Tópicos de gramática — leia e teste. Dominados: {mastered}/{topics.length}.
      </p>

      <div className="flex flex-col gap-3">
        {topics.map((t) => {
          const best = progress[t.id];
          const perfect = best === t.questions.length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {perfect ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">{t.level}</span>
                  <span className="truncate font-semibold">{t.title}</span>
                </span>
                <span className="truncate text-sm text-muted-foreground">{t.summary}</span>
              </span>
              {best !== undefined && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {best}/{t.questions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
