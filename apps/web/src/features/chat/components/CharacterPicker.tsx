import type { Character, CharactersResponse } from '../types';

export function CharacterPicker({
  meta,
  error,
  onSelect,
}: {
  meta: CharactersResponse | null;
  error: string | null;
  onSelect: (c: Character) => void;
}) {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Conversar</h1>
      <p className="mb-6 text-sm text-muted-foreground">Escolha com quem praticar.</p>

      {meta && !meta.ready && (
        <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          O servidor está sem <code>OPENAI_API_KEY</code>. Configure em <code>apps/api/.env</code>.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3">
        {meta?.characters.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c)}
            disabled={!meta.ready}
            className="rounded-2xl border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
          >
            <div className="text-lg font-semibold">{c.name}</div>
            <div className="text-sm text-muted-foreground">{c.blurb}</div>
          </button>
        ))}
      </div>
    </>
  );
}
