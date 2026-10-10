import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GamesHub, GamePlayer, type GameDefinition, type Level } from '@/features/game';

export function Jogar() {
  const [selection, setSelection] = useState<{ game: GameDefinition; level: Level } | null>(null);

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col px-4 py-4">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Início
      </Link>

      {!selection ? (
        <GamesHub onPick={(game, level) => setSelection({ game, level })} />
      ) : (
        <GamePlayer
          game={selection.game}
          level={selection.level}
          onExit={() => setSelection(null)}
        />
      )}
    </main>
  );
}
