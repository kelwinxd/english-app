import { useEffect, useRef } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import type { Correction, Entry, Stage } from '../types';
import { TypingIndicator } from './TypingIndicator';

export function MessageList({ entries, stage }: { entries: Entry[]; stage: Stage }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, stage]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
      {entries.length === 0 && stage === 'idle' && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Toque no microfone e fale em inglês. No fim de cada fala você recebe a resposta em áudio
          e as correções.
        </p>
      )}

      {entries.map((e, i) =>
        e.role === 'user' ? (
          <UserBubble key={i} text={e.text} corrections={e.corrections} />
        ) : (
          <AiBubble key={i} text={e.text} audio={e.audio} />
        ),
      )}

      {/* enquanto transcreve a fala do usuário */}
      {stage === 'stt' && (
        <div className="self-end flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> transcrevendo sua fala…
        </div>
      )}

      {/* enquanto o personagem "pensa" a resposta */}
      {stage === 'thinking' && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}

function UserBubble({ text, corrections }: { text: string; corrections: Correction[] }) {
  return (
    <div className="self-end max-w-[85%]">
      <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">
        {text || <em className="opacity-70">(sem transcrição)</em>}
      </div>
      {corrections.length > 0 && <CorrectionList corrections={corrections} />}
    </div>
  );
}

function CorrectionList({ corrections }: { corrections: Correction[] }) {
  return (
    <div className="mt-2 space-y-2 rounded-xl border border-amber-300/50 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
      <div className="font-medium text-amber-700 dark:text-amber-400">Correções</div>
      {corrections.map((c, j) => (
        <div key={j}>
          <span className="text-muted-foreground line-through">{c.original}</span> →{' '}
          <span className="font-medium">{c.corrected}</span>
          <div className="text-xs text-muted-foreground">
            <span className="rounded bg-muted px-1">{c.type}</span> {c.explanation}
          </div>
        </div>
      ))}
    </div>
  );
}

function AiBubble({ text, audio }: { text: string; audio: string }) {
  return (
    <div className="self-start max-w-[85%]">
      <div className="flex items-start gap-2 rounded-2xl rounded-bl-sm border bg-card px-4 py-2">
        <span>{text}</span>
        <button
          type="button"
          onClick={() => new Audio(audio).play().catch(() => {})}
          className="mt-1 shrink-0 text-muted-foreground hover:text-primary"
          aria-label="Ouvir de novo"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
