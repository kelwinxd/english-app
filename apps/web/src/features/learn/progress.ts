// Progresso do "Aprender" por viewer (localStorage). Guarda o melhor nº de
// acertos por tópico. Depois migra para o perfil (auth/banco).
const KEY = 'englishapp:learnProgress';

export type LearnProgress = Record<string, number>; // topicId -> melhor acertos

export function getProgress(): LearnProgress {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as LearnProgress;
  } catch {
    return {};
  }
}

export function saveBest(topicId: string, correct: number) {
  try {
    const p = getProgress();
    if (correct > (p[topicId] ?? -1)) {
      p[topicId] = correct;
      localStorage.setItem(KEY, JSON.stringify(p));
    }
  } catch {
    /* localStorage pode estar indisponível */
  }
}
