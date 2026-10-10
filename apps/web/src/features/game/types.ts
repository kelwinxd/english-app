import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Desafio genérico — serve para qualquer jogo. */
export type Challenge = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type GameResult = {
  score: number; // métrica principal (acertos, palavras encadeadas, etc.)
  summary: string; // frase curta pra tela de fim
};

/**
 * Contrato que TODO jogo implementa. O jogo recebe o `level` e cuida de buscar
 * os próprios dados (desafios, tema, etc.) internamente — o Player é agnóstico.
 * Avisa o fim com `onFinish` e pode voltar ao hub com `onExit`.
 */
export type GameComponentProps = {
  level: Level;
  onFinish: (result: GameResult) => void;
  onExit: () => void;
};

/** Registro de um jogo no hub. Adicionar jogo = adicionar um destes. */
export type GameDefinition = {
  id: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  Component: ComponentType<GameComponentProps>;
};
