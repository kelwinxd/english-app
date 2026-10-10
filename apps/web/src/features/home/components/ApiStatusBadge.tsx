import { cn } from '@/lib/utils';
import type { ApiStatus } from '../types';

const LABEL: Record<ApiStatus, string> = {
  checking: 'verificando…',
  ok: 'online',
  down: 'offline',
};

export function ApiStatusBadge({ status }: { status: ApiStatus }) {
  return (
    <footer className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          status === 'ok' && 'bg-green-500',
          status === 'down' && 'bg-destructive',
          status === 'checking' && 'bg-amber-400',
        )}
      />
      API: {LABEL[status]}
    </footer>
  );
}
