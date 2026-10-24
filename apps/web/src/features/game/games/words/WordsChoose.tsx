import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '../../types';
import { THEME_WORDS, type ThemeWord, type WordTheme } from './themeWords';

const GRID = 9; // total de cards por rodada

type Card = ThemeWord & { id: number; isTheme: boolean };

function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

/**
 * Modo "Words choose": aparecem vários cards de palavras e o jogador toca só
 * nas do tema, antes do tempo acabar. 1 palavra do tema por rodada; após 3
 * acertos, 2 por rodada. Errar um card fora do tema ou estourar o tempo = fim
 * (os cards do tema não escolhidos revelam a tradução).
 */
export function WordsChoose({
  theme,
  roundMs,
  onFinish,
  onExit,
}: {
  theme: WordTheme;
  roundMs: number;
  onFinish: GameComponentProps['onFinish'];
  onExit: () => void;
}) {
  const [successes, setSuccesses] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [lost, setLost] = useState(false);
  const [remaining, setRemaining] = useState(roundMs);

  const tickRef = useRef<number | null>(null);
  const successesRef = useRef(0);
  successesRef.current = successes;

  // Distratores: palavras dos OUTROS temas (sem repetir as do tema atual).
  const otherWords = useMemo(() => {
    const themeSet = new Set(theme.words.map((w) => w.en));
    const seen = new Set<string>();
    return THEME_WORDS.filter((t) => t.label !== theme.label)
      .flatMap((t) => t.words)
      .filter((w) => !themeSet.has(w.en) && !seen.has(w.en) && seen.add(w.en));
  }, [theme]);

  function clearTick() {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startTimer() {
    clearTick();
    const deadline = Date.now() + roundMs;
    setRemaining(roundMs);
    tickRef.current = window.setInterval(() => {
      const left = deadline - Date.now();
      if (left <= 0) {
        setRemaining(0);
        lose();
      } else {
        setRemaining(left);
      }
    }, 100);
  }

  function themeCountFor(succ: number) {
    return succ < 3 ? 1 : 2;
  }

  function newRound(succ: number) {
    const count = themeCountFor(succ);
    const themePicks = pick(theme.words, count).map((w) => ({ ...w, isTheme: true }));
    const distractors = pick(otherWords, GRID - count).map((w) => ({ ...w, isTheme: false }));
    const mixed = [...themePicks, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((c, i) => ({ ...c, id: i }));
    setCards(mixed);
    setSelected(new Set());
    setWrongId(null);
    setLost(false);
    startTimer();
  }

  function lose() {
    clearTick();
    setLost(true);
    window.setTimeout(() => {
      const n = successesRef.current;
      onFinish({ score: n, summary: `Você acertou ${n} rodada${n === 1 ? '' : 's'}.` });
    }, 1900);
  }

  function click(card: Card) {
    if (lost) return;
    if (!card.isTheme) {
      setWrongId(card.id);
      lose();
      return;
    }
    const next = new Set(selected);
    next.add(card.id);
    setSelected(next);

    const themeIds = cards.filter((c) => c.isTheme).map((c) => c.id);
    if (themeIds.every((id) => next.has(id))) {
      clearTick();
      const ns = successes + 1;
      window.setTimeout(() => {
        setSuccesses(ns);
        newRound(ns);
      }, 450);
    }
  }

  useEffect(() => {
    newRound(0);
    return () => clearTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.max(0, Math.min(100, (remaining / roundMs) * 100));
  const count = themeCountFor(successes);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button type="button" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          ← Jogos
        </button>
        <span className="text-muted-foreground">
          Tema: <span className="font-medium text-foreground">{theme.label}</span> · ✔ {successes}
        </span>
      </div>

      <p className="mb-2 text-center text-sm">
        Toque {count === 1 ? 'na palavra' : `nas ${count} palavras`} de{' '}
        <span className="font-semibold">{theme.label}</span>
      </p>

      {/* Timer */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', pct > 25 ? 'bg-primary' : 'bg-destructive')}
          style={{ width: `${pct}%`, transition: 'width 100ms linear' }}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {cards.map((c) => {
            const isSel = selected.has(c.id);
            const isWrong = wrongId === c.id;
            const reveal = lost && c.isTheme && !isSel;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => click(c)}
                disabled={lost}
                className={cn(
                  'flex min-h-[64px] flex-col items-center justify-center rounded-xl border p-2 text-center text-sm transition-colors',
                  isSel && 'border-green-500 bg-green-500/15',
                  isWrong && 'border-red-500 bg-red-500/15',
                  reveal && 'border-amber-400 bg-amber-100 dark:bg-amber-950/30',
                  !isSel && !isWrong && !reveal && 'hover:border-primary hover:bg-accent',
                )}
              >
                <span className="font-medium">{c.en}</span>
                {reveal && (
                  <span className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    {c.pt} · era do tema
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {lost && (
        <p className="pt-2 text-center text-sm font-medium text-destructive">
          {wrongId !== null ? 'Essa não era do tema!' : 'Tempo esgotado!'}
        </p>
      )}
    </div>
  );
}
