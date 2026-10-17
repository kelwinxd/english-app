import { BookOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Topic } from '../data';
import { LessonContent } from './LessonContent';

export function Lesson({
  topic,
  learned,
  onToggleLearned,
  onBack,
}: {
  topic: Topic;
  learned: boolean;
  onToggleLearned: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        ← Lições
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">{topic.level}</span>
          <h1 className="text-xl font-bold">{topic.title}</h1>
        </div>
        <p className="mb-3 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" /> Teoria
        </p>

        <LessonContent blocks={topic.content} />
      </div>

      <button
        type="button"
        onClick={onToggleLearned}
        className={cn(
          'mt-4 flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors',
          learned
            ? 'bg-green-500/15 text-green-700 dark:text-green-400'
            : 'bg-primary text-primary-foreground',
        )}
      >
        <Check className="h-4 w-4" />
        {learned ? 'Aprendido ✓ (desmarcar)' : 'Marcar como aprendido'}
      </button>
    </div>
  );
}
