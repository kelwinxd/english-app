import type { Character, CharactersResponse } from '../types';
import { Avatar } from './Avatar';

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
      <h2 className="mb-2 text-sm font-semibold text-foreground">Conversa livre</h2>

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
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
          >
            <Avatar src={c.avatar} name={c.name} size={52} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-semibold">
                {c.name} <span className="font-normal text-muted-foreground">— {c.role}</span>
              </span>
              <span className="truncate text-sm text-muted-foreground">{c.blurb}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
