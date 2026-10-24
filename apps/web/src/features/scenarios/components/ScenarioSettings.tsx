import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Switch } from '@/features/chat/components/Switch';

/**
 * Menu "Configurações do chat" do cenário: agrupa o cronômetro e o corretor
 * gramatical num só lugar (mesmo padrão do chat normal).
 */
export function ScenarioSettings({
  timerEnabled,
  onToggleTimer,
  correctGrammar,
  onToggleGrammar,
}: {
  timerEnabled: boolean;
  onToggleTimer: () => void;
  correctGrammar: boolean;
  onToggleGrammar: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Configurações do chat"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-64 rounded-xl border bg-card p-3 text-foreground shadow-lg">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Configurações do chat</p>

            <div className="flex items-center justify-between gap-3">
              <label htmlFor="scenario-timer" className="cursor-pointer text-sm">
                Cronômetro
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {timerEnabled ? '20s por resposta' : 'Sem tempo'}
                </span>
              </label>
              <Switch id="scenario-timer" checked={timerEnabled} onChange={onToggleTimer} />
            </div>

            <div className="my-2 h-px bg-border" />

            <div className="flex items-center justify-between gap-3">
              <label htmlFor="scenario-grammar" className="cursor-pointer text-sm">
                Corretor gramatical
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {correctGrammar ? 'Corrige seus erros' : 'Só conversa, sem corrigir'}
                </span>
              </label>
              <Switch id="scenario-grammar" checked={correctGrammar} onChange={onToggleGrammar} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
