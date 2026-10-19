import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Send, Square } from 'lucide-react';
import { useRecorder } from '@/hooks/useRecorder';
import { cn } from '@/lib/utils';
import { checkWord, checkTextWord } from '../../api/gameApi';
import type { GameComponentProps } from '../../types';

const TIME_OPTIONS = [5000, 10000]; // 5s ou 10s por palavra

const THEMES = [
  { label: 'Cozinha', en: 'kitchen and cooking' },
  { label: 'Tecnologia', en: 'technology' },
  { label: 'Trabalho', en: 'work and office' },
  { label: 'Viagem', en: 'travel' },
  { label: 'Esportes', en: 'sports' },
  { label: 'Natureza', en: 'nature' },
];

type Phase = 'intro' | 'waiting' | 'recording' | 'checking';
type Theme = (typeof THEMES)[number];

type Difficulty = 'normal' | 'surprise' | 'shift';
const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'normal', label: 'Normal', hint: 'Você escolhe e vê o tema o tempo todo.' },
  { id: 'surprise', label: 'Surpresa', hint: 'O gênio sorteia — você só descobre o tema ao começar.' },
  { id: 'shift', label: 'Camaleão', hint: 'Tema sorteado e o gênio troca no meio (cada tema dura ao menos 2 palavras).' },
];

function randomTheme() {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

function pickDifferentTheme(current: Theme) {
  const options = THEMES.filter((t) => t.en !== current.en);
  return options[Math.floor(Math.random() * options.length)];
}

export function WordChainGame({ onFinish, onExit }: GameComponentProps) {
  const [theme, setTheme] = useState(randomTheme);
  const [phase, setPhase] = useState<Phase>('intro');
  const [words, setWords] = useState<string[]>([]);
  const [roundMs, setRoundMs] = useState(5000);
  const [remaining, setRemaining] = useState(5000);
  const [note, setNote] = useState<string | null>(null);
  const [typedWord, setTypedWord] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  const recorder = useRecorder();
  const tickRef = useRef<number | null>(null);
  const roundMsRef = useRef(roundMs);
  roundMsRef.current = roundMs;
  const wordsRef = useRef<string[]>([]);
  wordsRef.current = words;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const themeWordsRef = useRef(0);
  const nextSwitchRef = useRef(2);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastModeRef = useRef<'text' | 'voice' | null>(null);

  function clearTick() {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startTimer() {
    clearTick();
    const ms = roundMsRef.current;
    const deadline = Date.now() + ms;
    setRemaining(ms);
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
    lastModeRef.current = null;
    if (difficulty !== 'normal') {
      setTheme(randomTheme());
    }
    themeWordsRef.current = 0;
    nextSwitchRef.current = 2 + Math.floor(Math.random() * 2);
    setWords([]);
    setTypedWord('');
    setNote(null);
    setPhase('waiting');
    startTimer();
  }

  function normalizeWord(word: string) {
    return word.trim().toLowerCase();
  }

  async function processWord(result: { word: string; related: boolean }) {
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
      gameOver(`"${word}" não é do tema`);
      return;
    }

    setWords((current) => [...current, word]);

    if (difficulty === 'shift') {
      themeWordsRef.current += 1;
      if (themeWordsRef.current >= nextSwitchRef.current) {
        const next = pickDifferentTheme(themeRef.current);
        setTheme(next);
        themeWordsRef.current = 0;
        nextSwitchRef.current = 2 + Math.floor(Math.random() * 2);
        resume(`Boa! +1: ${word} · 🧞 novo tema: ${next.label}!`);
        return;
      }
    }

    resume(`Boa! +1: ${word}`);
  }

  async function toggleRecord() {
    if (phase === 'waiting') {
      lastModeRef.current = 'voice';
      inputRef.current?.blur(); // fecha o teclado do aparelho ao gravar
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
      const result = await checkWord({ audio: blob, theme: theme.en });
      await processWord(result);
    } catch (e) {
      resume(e instanceof Error ? e.message : 'Falha ao checar a palavra.');
    }
  }

  async function submitTypedWord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = typedWord.trim();
    if (!text || phase !== 'waiting') return;

    lastModeRef.current = 'text';
    clearTick();
    setPhase('checking');
    setNote(null);
    setTypedWord('');

    try {
      const result = await checkTextWord({ text, theme: theme.en });
      await processWord(result);
    } catch (e) {
      resume(e instanceof Error ? e.message : 'Falha ao checar a palavra.');
    }
  }

  function resume(message: string) {
    setNote(message);
    setPhase('waiting');
    startTimer();
  }

  useEffect(() => () => clearTick(), []);

  useEffect(() => {
    if (phase === 'waiting' && lastModeRef.current !== 'voice') {
      inputRef.current?.focus();
    }
  }, [phase]);

  // ---------- Intro ----------
  if (phase === 'intro') {
    const hideTheme = difficulty !== 'normal';
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <Genie />

        {hideTheme ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">O gênio vai sortear o tema…</p>
            <p className="mb-1 text-2xl font-bold">🎲 ?</p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">O gênio escolheu um tema:</p>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-2xl font-bold">{theme.label}</span>
              <button
                type="button"
                onClick={() => setTheme(randomTheme())}
                className="rounded-lg border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
              >
                Trocar tema
              </button>
            </div>
          </>
        )}

        <p className="mb-5 max-w-xs text-sm text-muted-foreground">
          Fale ou digite uma palavra em inglês do tema a cada {roundMs / 1000}s. Acaba se você
          repetir, fugir do tema ou o tempo zerar.
        </p>

        <div className="my-4 h-px w-full max-w-xs bg-border" />

        {/* Tempo por palavra */}
        <div className="mb-5 flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Tempo por palavra</span>
          <div className="flex gap-2">
            {TIME_OPTIONS.map((ms) => (
              <button
                key={ms}
                type="button"
                onClick={() => setRoundMs(ms)}
                className={cn(
                  'rounded-lg border px-4 py-1.5 text-sm transition-colors',
                  roundMs === ms
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-accent',
                )}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>
        </div>

        {/* Dificuldade */}
        <div className="mb-5 flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Dificuldade</span>
          <div className="flex flex-wrap justify-center gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  difficulty === d.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-accent',
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <span className="max-w-xs text-xs text-muted-foreground">
            {DIFFICULTIES.find((d) => d.id === difficulty)?.hint}
          </span>
        </div>

        <div className="mt-6 flex w-full max-w-xs gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex-1 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={start}
            className="flex-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Começar
          </button>
        </div>
      </div>
    );
  }

  // ---------- Jogando ----------
  const pct = Math.max(0, Math.min(100, (remaining / roundMs) * 100));

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-2">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button type="button" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          ← Jogos
        </button>
        <span className="text-muted-foreground">
          Tema: <span className="font-medium text-foreground">{theme.label}</span> · {words.length}
        </span>
      </div>

      {/* Gênio (compacto) */}
      <div className="flex flex-col items-center pt-1">
        <Genie thinking={phase === 'checking'} />
        <p className="mt-1 text-sm text-muted-foreground">
          {phase === 'recording'
            ? 'Ouvindo…'
            : phase === 'checking'
              ? 'O gênio está pensando…'
              : 'O gênio espera sua palavra'}
        </p>
      </div>

      {/* Timer */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', pct > 30 ? 'bg-primary' : 'bg-destructive')}
          style={{ width: `${pct}%`, transition: 'width 100ms linear' }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-muted-foreground">{(remaining / 1000).toFixed(1)}s</p>

      {/* Entrada: colada ao gênio (texto + enviar + voz) */}
      <form onSubmit={submitTypedWord} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={typedWord}
          onChange={(e) => setTypedWord(e.target.value)}
          placeholder="Digite uma palavra em inglês…"
          disabled={phase !== 'waiting'}
          autoComplete="off"
          maxLength={80}
          ref={inputRef}
          className="min-w-0 flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={phase !== 'waiting' || !typedWord.trim()}
          aria-label="Enviar palavra digitada"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
        {phase === 'checking' ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </span>
        ) : (
          <button
            type="button"
            onClick={toggleRecord}
            aria-label={phase === 'recording' ? 'Enviar palavra falada' : 'Falar palavra'}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
              phase === 'recording'
                ? 'bg-destructive text-white'
                : 'border text-foreground hover:bg-accent',
            )}
          >
            {phase === 'recording' ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
      </form>

      {note && <p className="pt-2 text-center text-sm text-muted-foreground">{note}</p>}

      {/* Palavras encadeadas — preenchem o resto (o teclado do aparelho cobre esta área) */}
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap content-start gap-2">
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
    </div>
  );
}

function Genie({ thinking = false }: { thinking?: boolean }) {
  return (
    <div className={cn('text-5xl', thinking && 'animate-pulse')} role="img" aria-label="Gênio da lâmpada">
      🧞
    </div>
  );
}
