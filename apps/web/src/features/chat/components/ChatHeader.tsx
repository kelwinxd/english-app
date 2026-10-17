import type { Character } from '../types';
import { Avatar } from './Avatar';
import { ChatSettings } from './ChatSettings';

export function ChatHeader({
  character,
  turns,
  correctGrammar,
  onToggleGrammar,
}: {
  character: Character;
  turns: { used: number; max: number } | null;
  correctGrammar: boolean;
  onToggleGrammar: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={character.avatar} name={character.name} size={40} />
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">
            {character.name} <span className="font-normal text-muted-foreground">— {character.role}</span>
          </h1>
          <p className="truncate text-xs text-muted-foreground">{character.blurb}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {turns && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {turns.used}/{turns.max}
          </span>
        )}
        <ChatSettings correctGrammar={correctGrammar} onToggleGrammar={onToggleGrammar} />
      </div>
    </div>
  );
}
