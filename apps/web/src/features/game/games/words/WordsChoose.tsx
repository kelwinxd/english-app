import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
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
 * (os cards do tema não escolhidos revelam a tradução, e a tela fica para ler).
 */
export function WordsChoose({
  theme,
  roundMs,
  onExit,
}: {
  theme: WordTheme;
  roundMs: number;
  onExit: () => void;
}) {
  const [successes, setSuccesses] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [lost, setLost] = useState(false);
  const [remaining, setRemaining] = useState(roundMs);

  const tickRef = useRef<number | null>(null);
  const lastThemeRef = useRef<string[]>([]); // palavras do tema da rodada anterior

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
    // Evita repetir a(s) palavra(s) do tema da rodada anterior.
    const avail = theme.words.filter((w) => !lastThemeRef.current.includes(w.en));
    const pool = avail.length >= count ? avail : theme.words;
    const themePicks = pick(pool, count).map((w) => ({ ...w, isTheme: true }));
    lastThemeRef.current = themePicks.map((w) => w.en);

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
    setLost(true); // não muda de tela — deixa o reveal + botões pra ler
  }

  function replay() {
    setSuccesses(0);
    lastThemeRef.current = [];
    newRound(0);
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
                  !isSel && !isWrong && !reveal && !lost && 'hover:border-primary hover:bg-accent',
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

      {/* Fim de rodada: fica na tela pra ler, com ações embaixo */}
      {lost && (
        <div className="shrink-0 pt-3">
          <p className="mb-2 text-center text-sm font-medium text-destructive">
            {wrongId !== null ? 'Essa não era do tema!' : 'Tempo esgotado!'} · você acertou {successes}{' '}
            rodada{successes === 1 ? '' : 's'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onExit}
              className="flex-1 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={replay}
              className="flex-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Jogar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
