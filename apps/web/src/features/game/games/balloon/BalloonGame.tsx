import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameChallenges } from '../../hooks/useGameChallenges';
import type { Challenge, GameComponentProps } from '../../types';

const DURATION = 9; // segundos para o balão subir até o topo
const COLORS = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400'];

/**
 * Jogo do balão. Implementa GameComponentProps: carrega os próprios desafios
 * (por nível) e, com eles prontos, roda o tabuleiro.
 */
export function BalloonGame({ level, onFinish, onExit }: GameComponentProps) {
  const { challenges, loading, error, reload } = useGameChallenges(level);

  if (loading) {
    return (
      <Centered>
        <Loader2 className="mb-2 h-6 w-6 animate-spin" />
        Preparando desafios de {level}…
      </Centered>
    );
  }

  if (error || !challenges || challenges.length === 0) {
    return (
      <Centered>
        <p className="mb-3 text-destructive">{error ?? 'Nenhum desafio disponível.'}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reload}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Tentar de novo
          </button>
          <button type="button" onClick={onExit} className="rounded-lg border px-4 py-2 text-sm">
            Voltar
          </button>
        </div>
      </Centered>
    );
  }

  return <BalloonBoard challenges={challenges} onFinish={onFinish} onExit={onExit} />;
}

function BalloonBoard({
  challenges,
  onFinish,
  onExit,
}: {
  challenges: Challenge[];
  onFinish: GameComponentProps['onFinish'];
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const current = challenges[idx];
  const total = challenges.length;

  useEffect(() => {
    setAnswered(false);
    setPicked(null);
    timerRef.current = window.setTimeout(() => resolve(null), DURATION * 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function resolve(optionIndex: number | null) {
    if (answered) return;
    setAnswered(true);
    setPicked(optionIndex);
    if (timerRef.current) window.clearTimeout(timerRef.current);

    const isCorrect = optionIndex !== null && optionIndex === current.answerIndex;
    if (isCorrect) setScore((s) => s + 1);

    window.setTimeout(() => {
      if (idx + 1 >= total) {
        const finalScore = score + (isCorrect ? 1 : 0);
        onFinish({
          score: finalScore,
          summary: `${finalScore}/${total} acertos (${Math.round((finalScore / total) * 100)}%)`,
        });
      } else {
        setIdx((i) => i + 1);
      }
    }, 1200);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button type="button" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          ← Jogos
        </button>
        <span className="text-muted-foreground">
          {idx + 1}/{total} · ✔ {score}
        </span>
      </div>

      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="mb-1 text-xs text-muted-foreground">Toque no balão com a resposta certa</p>
        <p className="text-lg font-semibold">{current.prompt}</p>
      </div>

      <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border bg-gradient-to-b from-sky-100 to-background">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.answerIndex;
          const reveal = answered && (isCorrect || i === picked);
          return (
            <button
              key={`${idx}-${i}`}
              type="button"
              onClick={() => resolve(i)}
              disabled={answered}
              className="absolute"
              style={{
                left: `${((i + 0.5) * 100) / current.options.length}%`,
                transform: 'translateX(-50%)',
                top: '100%',
                animation: `balloon-rise ${DURATION}s linear forwards`,
                animationPlayState: answered ? 'paused' : 'running',
              }}
            >
              <span
                className={cn(
                  'flex h-20 w-20 items-center justify-center rounded-full px-2 text-center text-xs font-medium leading-tight text-white shadow-lg',
                  COLORS[i % COLORS.length],
                  reveal && isCorrect && 'ring-4 ring-green-500',
                  reveal && !isCorrect && i === picked && 'opacity-60 ring-4 ring-red-500',
                )}
              >
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 rounded-lg bg-muted/60 p-3 text-sm">
          {picked === current.answerIndex ? (
            <span className="font-medium text-green-600">Certo! </span>
          ) : (
            <span className="font-medium text-red-600">
              Resposta: {current.options[current.answerIndex]}.{' '}
            </span>
          )}
          <span className="text-muted-foreground">{current.explanation}</span>
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
      {children}
    </div>
  );
}
