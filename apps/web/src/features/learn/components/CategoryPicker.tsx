import { Clock, Languages, type LucideIcon } from 'lucide-react';
import { CATEGORY_META, CATEGORY_ORDER, type Category } from '../data';

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  tense: Clock,
  grammar: Languages,
};

/**
 * Passo de escolha entre as categorias — dois cards (Tempos verbais e
 * Gramática) que abrem a página da respectiva categoria.
 */
export function CategoryPicker({
  title,
  subtitle,
  count,
  onPick,
  onBack,
}: {
  title: string;
  subtitle: string;
  count: (c: Category) => number;
  onPick: (c: Category) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        ← Aprender
      </button>

      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>

      <div className="flex flex-col gap-3">
        {CATEGORY_ORDER.map((cat) => {
          const Icon = CATEGORY_ICON[cat];
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onPick(cat)}
              className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-semibold">
                  {meta.symbol} {meta.label}
                </span>
                <span className="text-sm text-muted-foreground">{count(cat)} tópicos</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
