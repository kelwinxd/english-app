import { Check, Circle, Clock, Languages, type LucideIcon } from 'lucide-react';
import { CATEGORY_META, CATEGORY_ORDER, type Category, type Topic } from '../data';

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  tense: Clock,
  grammar: Languages,
};

/** Lista reutilizável de tópicos (serve para Lições e Testes), agrupada por
 * categoria: Tempos verbais (⏳) e Gramática (🔤). */
export function TopicList({
  title,
  subtitle,
  topics,
  completed,
  badge,
  onSelect,
  onBack,
}: {
  title: string;
  subtitle: string;
  topics: Topic[];
  completed: (t: Topic) => boolean;
  badge?: (t: Topic) => string | null;
  onSelect: (t: Topic) => void;
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

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
        {CATEGORY_ORDER.map((cat) => {
          const group = topics.filter((t) => t.category === cat);
          if (group.length === 0) return null;
          const Icon = CATEGORY_ICON[cat];
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat} className="flex flex-col gap-3">
              {/* Cabeçalho da seção com símbolo da categoria */}
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-semibold">
                  {meta.symbol} {meta.label}
                </h2>
                <span className="text-xs text-muted-foreground">({group.length})</span>
              </div>

              {group.map((t) => {
                const done = completed(t);
                const right = badge?.(t) ?? null;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelect(t)}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
                  >
                    <span
                      className={
                        done
                          ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-600'
                          : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'
                      }
                    >
                      {done ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">
                          {t.level}
                        </span>
                        <span className="shrink-0 text-xs" title={meta.label}>
                          {meta.symbol}
                        </span>
                        <span className="truncate font-semibold">{t.title}</span>
                      </span>
                      <span className="truncate text-sm text-muted-foreground">{t.summary}</span>
                    </span>
                    {right && <span className="shrink-0 text-xs text-muted-foreground">{right}</span>}
                  </button>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
