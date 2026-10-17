import { Image, Sparkles, Target } from 'lucide-react';
import { BalloonGame } from './games/balloon/BalloonGame';
import { WordChainGame } from './games/words/WordChainGame';
import { ImageGame } from './games/images/ImageGame';
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
    name: 'Balão da Gramática',
    description: 'Estoure o balão com a resposta certa antes que ele suba.',
    skill: 'Gramática',
    Icon: Target,
    Component: BalloonGame,
  },
  {
    id: 'word-chain',
    name: 'Palavras por Tema',
    description: 'Fale ou escreva palavras do tema, sem repetir. O gênio espera.',
    skill: 'Vocabulário',
    Icon: Sparkles,
    Component: WordChainGame,
  },
  {
    id: 'image-name',
    name: 'Imagem → Palavra',
    description: 'Veja a imagem e escreva o objeto ou a ação em inglês.',
    skill: 'Vocabulário',
    Icon: Image,
    Component: ImageGame,
  },
];
