// Dados do jogo "Imagem → palavra".
// Imagens vêm do Wikimedia Commons por `Special:FilePath/<arquivo>` (link direto,
// sem API key). `file` é o nome do arquivo no Commons (verificado) e `accepted`
// são as respostas válidas em inglês (normalizadas na comparação). Como as fotos
// são reais e variadas, `accepted` inclui sinônimos para reduzir ambiguidade.

export type ImageMode = 'objects' | 'actions';

export type ImageItem = {
  file: string; // nome do arquivo no Wikimedia Commons
  accepted: string[]; // respostas aceitas (a 1ª é a canônica mostrada)
};

export type ImageTheme = {
  label: string;
  objects: ImageItem[];
  actions: ImageItem[];
};

export const IMAGE_THEMES: ImageTheme[] = [
  {
    label: 'Cozinha',
    objects: [
      { file: 'Kitchen sink.jpg', accepted: ['sink', 'kitchen sink', 'basin', 'washbasin', 'faucet', 'tap'] },
      { file: 'Knife.jpg', accepted: ['knife', 'kitchen knife', 'blade'] },
      { file: 'Spoon.jpg', accepted: ['spoon', 'teaspoon', 'tablespoon'] },
      { file: 'Fork.jpg', accepted: ['fork'] },
      { file: 'Refrigerator.jpg', accepted: ['fridge', 'refrigerator', 'freezer'] },
      { file: 'Plate.jpg', accepted: ['plate', 'dish'] },
    ],
    actions: [
      { file: 'Cooking.jpg', accepted: ['cook', 'cooking', 'make food', 'making food'] },
      { file: 'Dishwashing.jpg', accepted: ['wash the dishes', 'wash dishes', 'do the dishes', 'washing dishes', 'wash up', 'clean the dishes'] },
      { file: 'Eating.jpg', accepted: ['eat', 'eating', 'have a meal'] },
      { file: 'Drinking.jpg', accepted: ['drink', 'drinking'] },
    ],
  },
  {
    label: 'Casa',
    objects: [
      { file: 'Sofa.jpg', accepted: ['sofa', 'couch', 'settee'] },
      { file: 'Television.jpg', accepted: ['tv', 'television', 'telly', 'screen'] },
      { file: 'Window.jpg', accepted: ['window'] },
      { file: 'Clock.jpg', accepted: ['clock', 'wall clock'] },
      { file: 'Lamp.jpg', accepted: ['lamp', 'light', 'table lamp'] },
    ],
    actions: [
      { file: 'Reading.jpg', accepted: ['read', 'reading', 'read a book'] },
      { file: 'Sleeping.jpg', accepted: ['sleep', 'sleeping'] },
      { file: 'Writing.jpg', accepted: ['write', 'writing'] },
      { file: 'Painting.jpg', accepted: ['paint', 'painting'] },
      { file: 'Dancing.jpg', accepted: ['dance', 'dancing'] },
    ],
  },
  {
    label: 'Banheiro & rotina',
    objects: [
      { file: 'Toothbrush.jpg', accepted: ['toothbrush'] },
      { file: 'Towel.jpg', accepted: ['towel'] },
      { file: 'Mirror.jpg', accepted: ['mirror'] },
      { file: 'Soap.jpg', accepted: ['soap', 'bar of soap'] },
      { file: 'Shower.jpg', accepted: ['shower'] },
    ],
    actions: [
      { file: 'Shaving.jpg', accepted: ['shave', 'shaving'] },
      { file: 'Running.jpg', accepted: ['run', 'running', 'jog', 'jogging'] },
      { file: 'Swimming.jpg', accepted: ['swim', 'swimming'] },
      { file: 'Walking.jpg', accepted: ['walk', 'walking'] },
      { file: 'Driving.jpg', accepted: ['drive', 'driving'] },
    ],
  },
];

/** URL da imagem no Wikimedia Commons (link direto, sem API key). */
export function imageUrl(file: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=400`;
}

export function normalizeAnswer(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '')
    .replace(/\b(the|a|an)\b/g, ' ')
    .replace(/^\s*to\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCorrect(typed: string, accepted: string[]) {
  const t = normalizeAnswer(typed);
  return t.length > 0 && accepted.some((a) => normalizeAnswer(a) === t);
}

// --- Acertos acumulados por imagem (flashcard) — por viewer, no localStorage.
// Depois migra para o perfil do usuário (quando houver auth/banco).
const HITS_KEY = 'englishapp:imageHits';

export function getImageHits(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(HITS_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

export function addImageHit(file: string) {
  try {
    const hits = getImageHits();
    hits[file] = (hits[file] || 0) + 1;
    localStorage.setItem(HITS_KEY, JSON.stringify(hits));
  } catch {
    /* localStorage pode estar indisponível */
  }
}
