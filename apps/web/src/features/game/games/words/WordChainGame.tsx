import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Square, Send } from 'lucide-react';
import { useRecorder } from '@/hooks/useRecorder';
import { cn } from '@/lib/utils';
import { checkWord, checkTextWord } from '../../api/gameApi';
import type { GameComponentProps } from '../../types';

const ROUND_MS = 5000;

const THEMES = [
  { label: 'Cozinha', en: 'kitchen and cooking' },
  { label: 'Tecnologia', en: 'technology' },
  { label: 'Trabalho', en: 'work and office' },
  { label: 'Viagem', en: 'travel' },
  { label: 'Esportes', en: 'sports' },
  { label: 'Natureza', en: 'nature' },
];

type Phase = 'intro' | 'waiting' | 'recording' | 'checking';

function randomTheme() {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

export function WordChainGame({ onFinish, onExit }: GameComponentProps) {
  const [theme, setTheme] = useState(randomTheme);
  const [phase, setPhase] = useState<Phase>('intro');
  const [words, setWords] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(ROUND_MS);
  const [note, setNote] = useState<string | null>(null);
  const [typedWord, setTypedWord] = useState('');

  const recorder = useRecorder();
  const tickRef = useRef<number | null>(null);
  const wordsRef = useRef<string[]>([]);
  wordsRef.current = words;
  const inputRef = useRef(null)

  function clearTick() {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startTimer() {
    clearTick();

    const deadline = Date.now() + ROUND_MS;
    setRemaining(ROUND_MS);

    tickRef.current = window.setInterval(() => {
      const left = deadline - Date.now();

      if (left <= 0) {
        setRemaining(0);
        gameOver('tempo esgotado');
      } else {
        setRemaining(left);
      }
    }, 100);
  }

  function gameOver(reason: string) {
    clearTick();
    recorder.cancel();

    const n = wordsRef.current.length;

    onFinish({
      score: n,
      summary: `Você encadeou ${n} palavra${n === 1 ? '' : 's'}. Fim: ${reason}.`,
    });
  }

  function start() {
    setWords([]);
    setTypedWord('');
    setNote(null);
    setPhase('waiting');
    startTimer();
  }

  function normalizeWord(word: string) {
    return word.trim().toLowerCase();
  }

  async function processWord(
    result: { word: string; related: boolean },
  ) {
    const word = normalizeWord(result.word);

    if (!word) {
      resume('Não consegui identificar a palavra. Tente novamente.');
      return;
    }

    if (wordsRef.current.some((w) => normalizeWord(w) === word)) {
      gameOver(`você repetiu "${word}"`);
      return;
    }

    if (!result.related) {
      resume(`"${word}" não parece do tema. Tente outra.`);
      return;
    }

    setWords((current) => [...current, word]);
    resume(`Boa! +1: ${word}`);
  }

  async function toggleRecord() {
    if (phase === 'waiting') {
      setNote(null);
      setPhase('recording');
      recorder.start();
      return;
    }

    if (phase !== 'recording') return;

    try {
      const blob = await recorder.stop();

      clearTick();
      setPhase('checking');

      const result = await checkWord({
        audio: blob,
        theme: theme.en,
      });

      await processWord(result);
    } catch (e) {
      resume(
        e instanceof Error ? e.message : 'Falha ao checar a palavra.',
      );
    }
  }

  async function submitTypedWord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const text = typedWord.trim();

    if (!text || phase !== 'waiting') return;

    clearTick();
    setPhase('checking');
    setNote(null);
    setTypedWord('');

    try {
      const result = await checkTextWord({
        text,
        theme: theme.en,
      });

      await processWord(result);
    } catch (e) {
      resume(
        e instanceof Error ? e.message : 'Falha ao checar a palavra.',
      );
    }
  }

  function resume(message: string) {
    setNote(message);
    setPhase('waiting');
    startTimer();
  }

  useEffect(() => {
    return () => clearTick();
  }, []);

useEffect(() => {
  if (phase === 'waiting') {
    inputRef.current?.focus();
  }
}, [phase]);

  // ---------- Intro ----------
  if (phase === 'intro') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <Genie />

        <p className="mt-3 text-sm text-muted-foreground">
          O gênio escolheu um tema:
        </p>

        <p className="mb-1 text-2xl font-bold">{theme.label}</p>

        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
          Fale ou digite uma palavra em inglês do tema. Não pode repetir.
          O tempo é pausado durante a validação.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Começar
          </button>

          <button
            type="button"
            onClick={() => setTheme(randomTheme())}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Trocar tema
          </button>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Jogos
        </button>
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, (remaining / ROUND_MS) * 100));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onExit}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Jogos
        </button>

        <span className="text-muted-foreground">
          Tema:{' '}
          <span className="font-medium text-foreground">{theme.label}</span>
          {' · '}
          {words.length}
        </span>
      </div>

      {/* Gênio */}
      <div className="flex flex-col items-center py-4">
        <Genie thinking={phase === 'checking'} />

        <p className="mt-2 text-sm text-muted-foreground">
          {phase === 'recording'
            ? 'Ouvindo…'
            : phase === 'checking'
              ? 'O gênio está pensando…'
              : 'O gênio espera sua palavra'}
        </p>
      </div>

      {/* Timer */}
      <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full',
            pct > 30 ? 'bg-primary' : 'bg-destructive',
          )}
          style={{
            width: `${pct}%`,
            transition: 'width 100ms linear',
          }}
        />
      </div>

      <p className="mb-3 text-center text-xs text-muted-foreground">
        {(remaining / 1000).toFixed(1)}s
      </p>

      {/* Palavras encadeadas */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {note && (
        <p className="py-2 text-center text-sm text-muted-foreground">
          {note}
        </p>
      )}

      {/* Entrada por texto */}
      <form onSubmit={submitTypedWord} className="flex gap-2 pt-3">
        <input
          type="text"
          value={typedWord}
          onChange={(e) => setTypedWord(e.target.value)}
          placeholder="Digite uma palavra em inglês..."
          disabled={phase !== 'waiting'}
          autoComplete="off"
          maxLength={80}
          ref={inputRef}
          className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={phase !== 'waiting' || !typedWord.trim()}
          aria-label="Enviar palavra digitada"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>Enviar</span>
        </button>
      </form>

      {/* Entrada por voz */}
      <div className="flex flex-col items-center gap-1 pt-3">
        {phase === 'checking' ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : phase === 'recording' ? (
          <button
            type="button"
            onClick={toggleRecord}
            aria-label="Enviar palavra falada"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-white shadow-lg"
          >
            <Square className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleRecord}
            disabled={phase !== 'waiting'}
            aria-label="Falar palavra"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg disabled:opacity-50"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}

        <span className="text-xs text-muted-foreground">
          {phase === 'recording'
            ? 'Toque para enviar'
            : recorder.error ?? 'Ou toque no microfone para falar'}
        </span>
      </div>
    </div>
  );
}

function Genie({ thinking = false }: { thinking?: boolean }) {
  return (
    <div
      className={cn('text-6xl', thinking && 'animate-pulse')}
      role="img"
      aria-label="Gênio da lâmpada"
    >
      🧞
    </div>
  );
}
