import { Mic, Square, Trash2 } from 'lucide-react';
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
}: {
  limitReached: boolean;
  isRecording: boolean;
  seconds: number;
  busy: boolean;
  hint: string | null;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {limitReached ? (
        <p className="text-sm text-muted-foreground">Limite desta conversa atingido.</p>
      ) : isRecording ? (
        <div className="flex items-center gap-6">
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
            className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-white shadow-lg"
          >
            <Square className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg',
            busy && 'opacity-50',
          )}
        >
          <Mic className="h-5 w-5" />
        </button>
      )}
      <span className="text-xs text-muted-foreground">
        {isRecording ? `gravando… ${seconds}s (máx 60s)` : hint ?? 'toque para falar'}
      </span>
    </div>
  );
}
