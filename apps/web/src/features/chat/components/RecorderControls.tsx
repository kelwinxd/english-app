import { useState } from 'react';
import { Mic, Send, Square, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RecorderControls({
  limitReached,
  isRecording,
  seconds,
  busy,
  hint,
  onStart,
  onStop,
  onCancel,
  onSend,
}: {
  limitReached: boolean;
  isRecording: boolean;
  seconds: number;
  busy: boolean;
  hint: string | null;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');

  if (limitReached) {
    return (
      <p className="py-2 text-center text-sm text-muted-foreground">
        Limite desta conversa atingido.
      </p>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    onSend(t);
    setText('');
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex-1 text-sm text-muted-foreground">
          gravando… {seconds}s (máx 60s)
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancelar gravação"
          className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onStop}
          aria-label="Enviar áudio"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-white shadow"
        >
          <Square className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva em inglês…"
          disabled={busy}
          autoComplete="off"
          maxLength={500}
          className="min-w-0 flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          aria-label="Enviar mensagem"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          aria-label="Falar"
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-accent',
            busy && 'opacity-50',
          )}
        >
          <Mic className="h-4 w-4" />
        </button>
      </form>
      {hint && <span className="text-center text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
