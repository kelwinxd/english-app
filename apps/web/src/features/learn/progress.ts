// Progresso do "Aprender" por viewer (localStorage). Depois migra para o perfil.
// Dois eixos independentes: testes (melhor acerto) e lições (marcadas como aprendidas).
const SCORE_KEY = 'englishapp:learnProgress'; // topicId -> melhor acertos (quiz)
const LEARNED_KEY = 'englishapp:learnLearned'; // topicIds marcados como aprendidos

export type LearnProgress = Record<string, number>;

// ---- Testes (quiz) ----
export function getProgress(): LearnProgress {
  try {
    return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}') as LearnProgress;
  } catch {
    return {};
  }
}

export function saveBest(topicId: string, correct: number) {
  try {
    const p = getProgress();
    if (correct > (p[topicId] ?? -1)) {
      p[topicId] = correct;
      localStorage.setItem(SCORE_KEY, JSON.stringify(p));
    }
  } catch {
    /* localStorage pode estar indisponível */
  }
}

// ---- Lições (marcar como aprendido) ----
export function getLearned(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LEARNED_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

export function setLearned(topicId: string, learned: boolean): string[] {
  try {
    const set = new Set(getLearned());
    if (learned) set.add(topicId);
    else set.delete(topicId);
    const next = [...set];
    localStorage.setItem(LEARNED_KEY, JSON.stringify(next));
    return next;
  } catch {
    return getLearned();
  }
}
