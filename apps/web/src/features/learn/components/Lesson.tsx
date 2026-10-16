import type { Topic } from '../data';

export function Lesson({
  topic,
  onStart,
  onBack,
}: {
  topic: Topic;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        ← Tópicos
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">{topic.level}</span>
          <h1 className="text-xl font-bold">{topic.title}</h1>
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed">{topic.explanation}</p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
      >
        Iniciar quiz ({topic.questions.length} questões)
      </button>
    </div>
  );
}
