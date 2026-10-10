import { Sparkles, Target } from 'lucide-react';
import { BalloonGame } from './games/balloon/BalloonGame';
import { WordChainGame } from './games/words/WordChainGame';
import type { GameDefinition } from './types';

/**
 * Catálogo de jogos. Para adicionar um novo jogo:
 *   1. crie `games/<nome>/<Nome>Game.tsx` implementando GameComponentProps;
 *   2. registre-o aqui.
 * O hub e o player são agnósticos — nada mais precisa mudar.
 */
export const GAMES: GameDefinition[] = [
  {
    id: 'balloon',
    name: 'Jogo do balão',
    description: 'Toque no balão com a resposta certa antes que ele suba demais.',
    Icon: Target,
    Component: BalloonGame,
  },
  {
    id: 'word-chain',
    name: 'Palavras do tema',
    description: 'Fale palavras do tema a cada 5s, sem repetir. O gênio espera.',
    Icon: Sparkles,
    Component: WordChainGame,
  },
];
