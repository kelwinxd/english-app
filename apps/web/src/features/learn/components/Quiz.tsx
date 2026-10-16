import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Topic } from '../data';

export function Quiz({
  topic,
  onFinish,
  onExit,
}: {
  topic: Topic;
  onFinish: (correct: number) => void;
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = topic.questions[idx];
  const answered = picked !== null;

  function choose(i: number) {
    if (answered) return;
    setPicked(i);
    if (i === q.answerIndex) setCorrect((c) => c + 1);
  }

  function next() {
    if (idx + 1 >= topic.questions.length) {
      onFinish(correct);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button type="button" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          ← Sair
        </button>
        <span className="text-muted-foreground">
          {idx + 1}/{topic.questions.length} · ✔ {correct}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="mb-4 text-lg font-semibold">{q.prompt}</p>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answerIndex;
            const show = answered && (isAnswer || i === picked);
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                  !answered && 'hover:border-primary hover:bg-accent',
                  show && isAnswer && 'border-green-500 bg-green-500/10',
                  show && !isAnswer && i === picked && 'border-red-500 bg-red-500/10',
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <p className="mt-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{q.explanation}</p>
        )}
      </div>

      {answered && (
        <button
          type="button"
          onClick={next}
          className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          {idx + 1 >= topic.questions.length ? 'Ver resultado' : 'Próxima'}
        </button>
      )}
    </div>
  );
}
