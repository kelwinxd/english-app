import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/features/chat/components/Avatar';
import { MessageList } from '@/features/chat/components/MessageList';
import { RecorderControls } from '@/features/chat/components/RecorderControls';
import { Switch } from '@/features/chat/components/Switch';
import { useScenario } from '../useScenario';
import { menuImage, type MenuItem, type Scenario } from '../data';

export function ScenarioChat({ scenario, onExit }: { scenario: Scenario; onExit: () => void }) {
  const s = useScenario(scenario);
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border">
      {/* Cena de fundo (garçonete/lanchonete) */}
      {scenario.background && !bgFailed ? (
        <img
          src={menuImage(scenario.background)}
          alt=""
          onError={() => setBgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-400" />
      )}
      {/* Overlay para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

      {/* Conteúdo sobre a cena */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 px-3 py-2">
          <button
            type="button"
            onClick={onExit}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Avatar src={scenario.avatar} name={scenario.characterName} size={38} className="ring-2 ring-white/70" />
          <div className="min-w-0 flex-1 text-white drop-shadow">
            <p className="truncate text-sm font-semibold">{scenario.characterName}</p>
            <p className="truncate text-xs text-white/80">
              {scenario.label} · {scenario.place}
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur"
            title="Cronômetro de 20s por resposta"
          >
            <Clock className="h-3.5 w-3.5" />
            <span
              className={cn('tabular-nums', s.timerEnabled && s.secondsLeft <= 5 && 'text-red-300')}
            >
              {s.timerEnabled ? `${s.secondsLeft}s` : '20s'}
            </span>
            <Switch checked={s.timerEnabled} onChange={s.toggleTimer} />
          </div>
        </div>

        {/* Mensagens sobre a cena */}
        <MessageList entries={s.entries} stage={s.stage} />

        {/* Alimentos — colados ao chat, parte da cena */}
        <div className="shrink-0 px-2 pb-1 pt-1">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {scenario.menu.map((item) => (
              <MenuCard key={item.en} item={item} />
            ))}
          </div>
        </div>

        {/* Barra do cronômetro (só quando ligado) */}
        {s.timerEnabled && (
          <div className="h-1 w-full shrink-0 bg-white/20">
            <div
              className={cn('h-full', s.timePct > 25 ? 'bg-primary' : 'bg-destructive')}
              style={{ width: `${s.timePct}%`, transition: 'width 100ms linear' }}
            />
          </div>
        )}

        {/* Entrada (fundo sólido para legibilidade) */}
        <div className="shrink-0 border-t bg-background px-3 py-2">
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
    </div>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex w-[72px] shrink-0 flex-col items-center rounded-xl bg-black/35 p-1.5 text-center text-white backdrop-blur">
      {failed ? (
        <span className="flex h-12 w-full items-center justify-center text-2xl">{item.emoji}</span>
      ) : (
        <img
          src={menuImage(item.file)}
          alt={item.en}
          onError={() => setFailed(true)}
          className="h-12 w-full rounded-lg object-cover"
        />
      )}
      <span className="mt-1 w-full truncate text-[11px] font-medium">{item.en}</span>
      <span className="text-[10px] text-white/80">{item.price}</span>
    </div>
  );
}
