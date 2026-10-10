import { useState } from 'react';
import type { GameDefinition, GameResult, Level } from '../types';

/**
 * Roda o jogo escolhido e mostra a tela de fim. Totalmente agnóstico: só
 * depende do contrato GameComponentProps. Cada jogo carrega seus próprios dados.
 */
export function GamePlayer({
  game,
  level,
  onExit,
}: {
  game: GameDefinition;
  level: Level;
  onExit: () => void;
}) {
  const [result, setResult] = useState<GameResult | null>(null);
  const Game = game.Component;

  if (result) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">Fim de jogo</p>
        <p className="my-1 text-5xl font-bold">{result.score}</p>
        <p className="mb-5 max-w-xs text-sm text-muted-foreground">{result.summary}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Jogar de novo
          </button>
          <button type="button" onClick={onExit} className="rounded-lg border px-4 py-2 text-sm">
            Outros jogos
          </button>
        </div>
      </div>
    );
  }

  return <Game level={level} onFinish={setResult} onExit={onExit} />;
}
