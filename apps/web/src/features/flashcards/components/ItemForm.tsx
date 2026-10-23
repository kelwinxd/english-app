import { useState } from 'react';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addItem, updateItem } from '../store';
import { suggestItem } from '../api';
import { ITEM_TYPE_LABEL, type ItemType, type SrsItem } from '../types';

const TYPES: ItemType[] = ['word', 'phrase', 'grammar'];

export function ItemForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: SrsItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(initial?.content ?? '');
  const [translation, setTranslation] = useState(initial?.translation ?? '');
  const [example, setExample] = useState(initial?.example ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [itemType, setItemType] = useState<ItemType>(initial?.itemType ?? 'word');
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function aiSuggest() {
    if (!content.trim() || loadingAI) return;
    setLoadingAI(true);
    setError(null);
    try {
      const s = await suggestItem(content.trim());
      setTranslation(s.translation);
      setExample(s.example);
      setTags(s.tags.join(', '));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na sugestão.');
    } finally {
      setLoadingAI(false);
    }
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const c = content.trim();
    if (!c) return;
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (initial) {
      updateItem(initial.id, {
        content: c,
        translation: translation.trim(),
        example: example.trim(),
        itemType,
        tags: parsedTags,
      });
    } else {
      addItem({ content: c, translation, example, itemType, tags: parsedTags, source: 'manual' });
    }
    onSaved();
  }

  const label = 'mb-1 block text-xs font-medium text-muted-foreground';
  const field =
    'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary';

  return (
    <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onCancel}
        className="mb-3 inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {initial ? 'Minhas palavras' : 'Cancelar'}
      </button>

      <h1 className="mb-4 text-xl font-bold">{initial ? 'Editar flashcard' : 'Novo flashcard'}</h1>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-2">
        <div>
          <label className={label}>Palavra / frase (inglês)</label>
          <div className="flex gap-2">
            <input
              className={field}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ex.: sink, to shave, make up your mind"
              autoFocus
            />
            <button
              type="button"
              onClick={aiSuggest}
              disabled={!content.trim() || loadingAI}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-3 text-sm font-medium text-secondary-foreground disabled:opacity-50"
            >
              {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              IA
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            A IA preenche tradução, exemplo e tags — você revisa antes de salvar.
          </p>
        </div>

        <div>
          <label className={label}>Tradução (pt-BR)</label>
          <input className={field} value={translation} onChange={(e) => setTranslation(e.target.value)} />
        </div>

        <div>
          <label className={label}>Exemplo (inglês)</label>
          <textarea
            className={cn(field, 'resize-none')}
            rows={2}
            value={example}
            onChange={(e) => setExample(e.target.value)}
          />
        </div>

        <div>
          <label className={label}>Tags (separadas por vírgula)</label>
          <input
            className={field}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="noun, food"
          />
        </div>

        <div>
          <label className={label}>Tipo</label>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setItemType(t)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  itemType === t ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                )}
              >
                {ITEM_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="mt-3 flex shrink-0 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!content.trim()}
          className="flex-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
