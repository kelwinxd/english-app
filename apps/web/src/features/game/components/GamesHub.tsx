import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GAMES } from '../registry';
import type { GameDefinition, Level } from '../types';

const LEVELS: Level[] = ['A2', 'B1', 'B2'];

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
            <span className="flex flex-col">
              <span className="text-lg font-semibold">{game.name}</span>
              <span className="text-sm text-muted-foreground">{game.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
