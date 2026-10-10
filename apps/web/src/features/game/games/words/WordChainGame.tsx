import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';
import { useRecorder } from '@/hooks/useRecorder';
import { cn } from '@/lib/utils';
import { checkWord } from '../../api/gameApi';
import type { GameComponentProps } from '../../types';

const ROUND_MS = 5000; // 5s por palavra

// Temas: label em pt (mostrado) + `en` (enviado para a checagem).
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

/**
 * Jogo de encadear palavras. Fale palavras do tema, uma por rodada (5s). Não
 * pode repetir. Acaba quando o tempo zera ou você repete uma palavra.
 * Implementa GameComponentProps (não usa `level`).
 */
export function WordChainGame({ onFinish, onExit }: GameComponentProps) {
  const [theme, setTheme] = useState(randomTheme);
  const [phase, setPhase] = useState<Phase>('intro');
  const [words, setWords] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(ROUND_MS);
  const [note, setNote] = useState<string | null>(null);

  const recorder = useRecorder();
  const tickRef = useRef<number | null>(null);
  const wordsRef = useRef<string[]>([]);
  wordsRef.current = words;

  function clearTick() {
    if (tickRef.current) {
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
    setNote(null);
    setPhase('waiting');
    startTimer();
  }

  async function toggleRecord() {
    if (phase === 'waiting') {
      setNote(null);
      setPhase('recording');
      recorder.start();
      return;
    }
    if (phase !== 'recording') return;

    const blob = await recorder.stop();
    clearTick(); // pausa o tempo durante a checagem
    setPhase('checking');

    try {
      const { word, related } = await checkWord({ audio: blob, theme: theme.en });
      if (!word) {
        resume('Não entendi, tente de novo.');
      } else if (wordsRef.current.includes(word)) {
        gameOver(`você repetiu "${word}"`);
      } else if (!related) {
        resume(`"${word}" não parece do tema. Tente outra.`);
      } else {
        setWords((w) => [...w, word]);
        resume(`boa! +1: ${word}`);
      }
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

  // ---------- Intro ----------
  if (phase === 'intro') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <Genie />
        <p className="mt-3 text-sm text-muted-foreground">O gênio escolheu um tema:</p>
        <p className="mb-1 text-2xl font-bold">{theme.label}</p>
        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
          Fale uma palavra do tema a cada 5s. Não pode repetir. Acaba se o tempo zerar ou você
          repetir.
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

  // ---------- Jogando ----------
  const pct = Math.max(0, Math.min(100, (remaining / ROUND_MS) * 100));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button type="button" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          ← Jogos
        </button>
        <span className="text-muted-foreground">
          Tema: <span className="font-medium text-foreground">{theme.label}</span> · {words.length}
        </span>
      </div>

      {/* Gênio esperando */}
      <div className="flex flex-col items-center py-4">
        <Genie thinking={phase === 'checking'} />
        <p className="mt-2 text-sm text-muted-foreground">
          {phase === 'recording'
            ? 'ouvindo…'
            : phase === 'checking'
              ? 'o gênio está pensando…'
              : 'o gênio espera sua palavra'}
        </p>
      </div>

      {/* Timer */}
      <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', pct > 30 ? 'bg-primary' : 'bg-destructive')}
          style={{ width: `${pct}%`, transition: 'width 100ms linear' }}
        />
      </div>
      <p className="mb-3 text-center text-xs text-muted-foreground">
        {(remaining / 1000).toFixed(1)}s
      </p>

      {/* Palavras encadeadas */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {words.map((w, i) => (
            <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              {w}
            </span>
          ))}
        </div>
      </div>

      {note && <p className="py-2 text-center text-sm text-muted-foreground">{note}</p>}

      {/* Microfone */}
      <div className="flex flex-col items-center gap-1 pt-1">
        {phase === 'checking' ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : phase === 'recording' ? (
          <button
            type="button"
            onClick={toggleRecord}
            aria-label="Enviar palavra"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-white shadow-lg"
          >
            <Square className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleRecord}
            aria-label="Falar palavra"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
        <span className="text-xs text-muted-foreground">
          {phase === 'recording' ? 'toque para enviar' : recorder.error ?? 'toque e fale a palavra'}
        </span>
      </div>
    </div>
  );
}

/** Gênio da lâmpada (placeholder em emoji — trocar por ilustração depois). */
function Genie({ thinking = false }: { thinking?: boolean }) {
  return (
    <div className={cn('text-6xl', thinking && 'animate-pulse')} role="img" aria-label="Gênio da lâmpada">
      🧞
    </div>
  );
}
