import { cn } from '@/lib/utils';
import { SCENARIOS, type Scenario } from '../data';

/** Grade de "Treinar ocasiões". Só as ativas são clicáveis (MVP: lanchonete). */
export function OccasionPicker({ onPick }: { onPick: (s: Scenario) => void }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-foreground">Treinar ocasiões</h2>
      <div className="grid grid-cols-2 gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => s.available && onPick(s)}
            disabled={!s.available}
            className={cn(
              'flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors',
              s.available ? 'hover:border-primary hover:bg-accent' : 'opacity-60',
            )}
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="flex flex-col">
              <span className="font-semibold">{s.label}</span>
              {!s.available && <span className="text-xs text-muted-foreground">em breve</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
