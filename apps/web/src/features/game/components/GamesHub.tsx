import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GAMES } from '../registry';
import type { GameDefinition, Level, Skill } from '../types';

const LEVELS: Level[] = ['A2', 'B1', 'B2'];

const SKILL_STYLES: Record<Skill, string> = {
  Gramática: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  Vocabulário: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  Escuta: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Pronúncia: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
};

function SkillBadge({ skill }: { skill: Skill }) {
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', SKILL_STYLES[skill])}>
      {skill}
    </span>
  );
}

/** Lista os jogos do catálogo + seletor de nível. Agnóstico de qual jogo é. */
export function GamesHub({ onPick }: { onPick: (game: GameDefinition, level: Level) => void }) {
  const [level, setLevel] = useState<Level>('B1');

  return (
    <div className="flex-1 overflow-y-auto">
      <h1 className="mb-1 text-2xl font-bold">Jogar</h1>
      <p className="mb-4 text-sm text-muted-foreground">Pratique jogando. Escolha o nível e o jogo.</p>

      <div className="mb-5">
        <span className="mb-2 block text-xs font-medium text-muted-foreground">Nível</span>
        <div className="flex gap-2">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              className={cn(
                'rounded-lg border px-4 py-1.5 text-sm transition-colors',
                level === lv
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:bg-accent',
              )}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => onPick(game, level)}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <game.Icon className="h-6 w-6" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2">
                <span className="truncate text-lg font-semibold">{game.name}</span>
                <SkillBadge skill={game.skill} />
              </span>
              <span className="text-sm text-muted-foreground">{game.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
