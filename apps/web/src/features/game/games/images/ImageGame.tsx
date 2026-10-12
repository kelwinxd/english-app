import { useEffect, useRef, useState } from 'react';
import { ImageOff, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameComponentProps } from '../../types';
import {
  addImageHit,
  getImageHits,
  IMAGE_THEMES,
  imageUrl,
  isCorrect,
  type ImageItem,
  type ImageMode,
} from './data';

const ROUND_MS = 5000;

const MODES: { id: ImageMode; label: string; hint: string }[] = [
  { id: 'objects', label: 'Objetos', hint: 'Escreva o nome do objeto em inglês (ex.: sink).' },
  { id: 'actions', label: 'Ações', hint: 'Escreva a ação em inglês (ex.: wash the dishes).' },
];

type Phase = 'intro' | 'playing';

/**
 * Jogo "Imagem → palavra". Aparece uma imagem do tema e você escreve o nome do
 * objeto (nível Objetos) ou da ação (nível Ações) em inglês em até 5s.
 * Implementa GameComponentProps (não usa `level`).
 */
export function ImageGame({ onFinish, onExit }: GameComponentProps) {
  const [mode, setMode] = useState<ImageMode>('objects');
  const [themeIdx, setThemeIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [queue, setQueue] = useState<ImageItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(ROUND_MS);
  const [typed, setTyped] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hitsMap, setHitsMap] = useState<Record<string, number>>({});

  const tickRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  scoreRef.current = score;
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = IMAGE_THEMES[themeIdx];
  const current = queue[idx];

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
        finish('tempo esgotado');
      } else {
        setRemaining(left);
      }
    }, 100);
  }

  function finish(reason: string, finalScore = scoreRef.current) {
    clearTick();
    onFinish({ score: finalScore, summary: `Você acertou ${finalScore}. Fim: ${reason}.` });
  }

  function start() {
    const items = mode === 'objects' ? theme.objects : theme.actions;
    const hits = getImageHits();
    setHitsMap(hits);
    // Flashcard: menos acertos primeiro; os mais dominados ficam por último.
    const ordered = [...items].sort((a, b) => {
      const diff = (hits[a.file] || 0) - (hits[b.file] || 0);
      return diff !== 0 ? diff : Math.random() - 0.5;
    });
    setQueue(ordered);
    setIdx(0);
    setScore(0);
    setTyped('');
    setNote(null);
    setImgLoaded(false);
    setImgError(false);
    setPhase('playing'); // o timer começa quando a imagem carrega
  }

  function advance() {
    clearTick();
    setTyped('');
    setImgLoaded(false);
    setImgError(false);
    setIdx((i) => i + 1);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase !== 'playing' || !current || !imgLoaded) return;
    const value = typed.trim();
    if (!value) return;

    if (isCorrect(value, current.accepted)) {
      const newScore = score + 1;
      setScore(newScore);
      addImageHit(current.file); // flashcard: acumula acerto desta imagem
      setHitsMap((m) => ({ ...m, [current.file]: (m[current.file] || 0) + 1 }));
      setNote(`✔ ${current.accepted[0]}`);
      if (idx + 1 >= queue.length) {
        finish('você nomeou todas as imagens!', newScore);
      } else {
        advance();
      }
    } else {
      setNote('não é isso, tente de novo');
      setTyped('');
    }
  }

  function onImgReady() {
    setImgLoaded(true);
    startTimer();
  }

  useEffect(() => () => clearTick(), []);

  useEffect(() => {
    if (phase === 'playing' && imgLoaded) inputRef.current?.focus();
  }, [phase, imgLoaded, idx]);

  // ---------- Intro ----------
  if (phase === 'intro') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <div className="text-6xl" role="img" aria-label="Gênio da lâmpada">
          🧞
        </div>
        <p className="mt-3 mb-5 max-w-xs text-sm text-muted-foreground">
          O gênio mostra uma imagem do tema e você escreve, em inglês, o nome do que aparece — em
          até 5s por imagem.
        </p>

        <div className="mb-4 flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Nível</span>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  mode === m.id ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <span className="max-w-xs text-xs text-muted-foreground">
            {MODES.find((m) => m.id === mode)?.hint}
          </span>
        </div>

        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Tema</span>
          <div className="flex flex-wrap justify-center gap-2">
            {IMAGE_THEMES.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setThemeIdx(i)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  themeIdx === i ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Começar
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
          {theme.label} · {mode === 'objects' ? 'Objetos' : 'Ações'} · {idx + 1}/{queue.length} · ✔ {score}
        </span>
      </div>

      {/* Imagem */}
      <div className="relative mx-auto flex aspect-[4/3] w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {current && !imgError && (
          <img
            key={`${idx}-${current.file}`}
            src={imageUrl(current.file)}
            alt="Adivinhe"
            onLoad={onImgReady}
            onError={() => {
              setImgError(true);
              onImgReady();
            }}
            className={cn('h-full w-full object-cover', !imgLoaded && 'opacity-0')}
          />
        )}
        {!imgLoaded && !imgError && (
          <Loader2 className="absolute h-6 w-6 animate-spin text-muted-foreground" />
        )}
        {imgError && (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff className="h-6 w-6" />
            <span className="text-xs">imagem indisponível</span>
          </div>
        )}
        {current && (
          <span
            className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white"
            title="acertos acumulados desta imagem"
          >
            ★ {hitsMap[current.file] || 0}
          </span>
        )}
      </div>

      {/* Timer */}
      <div className="mb-1 mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', pct > 30 ? 'bg-primary' : 'bg-destructive')}
          style={{ width: `${pct}%`, transition: 'width 100ms linear' }}
        />
      </div>
      <p className="mb-2 text-center text-xs text-muted-foreground">
        {imgLoaded ? `${(remaining / 1000).toFixed(1)}s` : 'carregando imagem…'}
      </p>

      {note && <p className="mb-1 text-center text-sm text-muted-foreground">{note}</p>}

      {/* Entrada por texto */}
      <form onSubmit={submit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={mode === 'objects' ? 'Nome do objeto em inglês…' : 'Ação em inglês…'}
          disabled={!imgLoaded}
          autoComplete="off"
          maxLength={80}
          ref={inputRef}
          className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!imgLoaded || !typed.trim()}
          aria-label="Enviar resposta"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
}
