import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScenarioChat } from './ScenarioChat';
import type { Scenario } from '../data';

/**
 * Orquestra um cenário: se ele tem um escopo a escolher antes (ex.: Trabalho →
 * área), mostra o select primeiro; depois entra no chat com o escopo definido.
 */
export function ScenarioRunner({ scenario, onExit }: { scenario: Scenario; onExit: () => void }) {
  const needsScope = !!scenario.scopeOptions?.length;
  const [scope, setScope] = useState<string | null>(null);

  if (needsScope && scope === null) {
    return <ScopePicker scenario={scenario} onConfirm={setScope} onExit={onExit} />;
  }
  return <ScenarioChat scenario={scenario} scope={scope ?? undefined} onExit={onExit} />;
}

function ScopePicker({
  scenario,
  onConfirm,
  onExit,
}: {
  scenario: Scenario;
  onConfirm: (scope: string) => void;
  onExit: () => void;
}) {
  const options = scenario.scopeOptions ?? [];
  const [value, setValue] = useState(options[0]?.value ?? '');

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border p-5">
      <button
        type="button"
        onClick={onExit}
        aria-label="Voltar"
        className="mb-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="mb-3 text-4xl">{scenario.emoji}</span>
        <h2 className="mb-1 text-xl font-bold">{scenario.label}</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {scenario.scopeTitle ?? 'Escolha o tema da conversa'}
        </p>

        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mb-5 w-full max-w-xs rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => value && onConfirm(value)}
          disabled={!value}
          className="w-full max-w-xs rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Começar conversa
        </button>
      </div>
    </div>
  );
}
