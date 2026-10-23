import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/features/chat/components/Avatar';
import { MessageList } from '@/features/chat/components/MessageList';
import { RecorderControls } from '@/features/chat/components/RecorderControls';
import { useScenario } from '../useScenario';
import { menuImage, type MenuItem, type Scenario } from '../data';

export function ScenarioChat({ scenario, onExit }: { scenario: Scenario; onExit: () => void }) {
  const s = useScenario(scenario);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar src={scenario.avatar} name={scenario.characterName} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{scenario.characterName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {scenario.label} · {scenario.place}
          </p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
            s.secondsLeft > 5 ? 'bg-muted text-muted-foreground' : 'bg-destructive/15 text-destructive',
          )}
        >
          <Clock className="h-3 w-3" />
          {s.secondsLeft}s
        </span>
      </div>

      {/* Cardápio */}
      <div className="shrink-0 border-b bg-muted/30 px-2 py-2">
        <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Cardápio
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {scenario.menu.map((item) => (
            <MenuCard key={item.en} item={item} />
          ))}
        </div>
      </div>

      <MessageList entries={s.entries} stage={s.stage} />

      {/* Timer bar */}
      <div className="h-1 w-full shrink-0 bg-muted">
        <div
          className={cn('h-full', s.timePct > 25 ? 'bg-primary' : 'bg-destructive')}
          style={{ width: `${s.timePct}%`, transition: 'width 100ms linear' }}
        />
      </div>

      <div className="shrink-0 border-t px-3 py-2">
        {s.error && <p className="mb-2 text-sm text-destructive">{s.error}</p>}
        <RecorderControls
          limitReached={false}
          isRecording={s.isRecording}
          seconds={s.recordSeconds}
          busy={s.busy}
          hint={s.recorderError}
          onStart={s.startRecording}
          onStop={s.stopAndSend}
          onCancel={s.cancelRecording}
          onSend={s.sendText}
        />
      </div>
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex w-20 shrink-0 flex-col items-center rounded-xl border bg-card p-1.5 text-center">
      {failed ? (
        <span className="text-2xl">{item.emoji}</span>
      ) : (
        <img
          src={menuImage(item.file)}
          alt={item.en}
          onError={() => setFailed(true)}
          className="h-12 w-full rounded-lg object-cover"
        />
      )}
      <span className="mt-1 w-full truncate text-[11px] font-medium">{item.en}</span>
      <span className="text-[10px] text-muted-foreground">{item.price}</span>
    </div>
  );
}
