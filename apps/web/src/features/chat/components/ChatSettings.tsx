import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Switch } from './Switch';

export function ChatSettings({
  correctGrammar,
  onToggleGrammar,
}: {
  correctGrammar: boolean;
  onToggleGrammar: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Configurações"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Settings className="h-5 w-5" />
      </button>

      {open && (
        <>
          {/* backdrop: fecha ao clicar fora */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 w-64 rounded-xl border bg-card p-3 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="grammar-switch" className="cursor-pointer text-sm">
                Corretor gramatical
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {correctGrammar ? 'Corrige seus erros' : 'Só conversa, sem corrigir'}
                </span>
              </label>
              <Switch id="grammar-switch" checked={correctGrammar} onChange={onToggleGrammar} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
