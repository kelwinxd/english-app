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
      { file: 'Set of three spoons MET 143249.jpg', accepted: ['spoon', 'spoons', 'teaspoon', 'tablespoon'] },
      { file: 'Dutch - Knife and Fork - Walters 571806.jpg', accepted: ['fork'] },
      { file: 'Samsung smart refrigerator - The Talking Fridge.jpg', accepted: ['fridge', 'refrigerator', 'freezer'] },
      { file: 'Empty breakfast plate Rose Café Philip Lane Tottenham London England 01.jpg', accepted: ['plate', 'dish'] },
    ],
    actions: [
      { file: 'Cooking.jpg', accepted: ['cook', 'cooking', 'make food', 'making food'] },
      { file: 'Woman washing dishes in kitchen sink while holding glass in hand.jpg', accepted: ['wash the dishes', 'wash dishes', 'do the dishes', 'washing dishes', 'wash up', 'clean the dishes'] },
      { file: 'Eating.jpg', accepted: ['eat', 'eating', 'have a meal'] },
      { file: 'Woman drinking water.jpg', accepted: ['drink', 'drinking'] },
    ],
  },
  {
    label: 'Casa',
    objects: [
      { file: 'Sofa.jpg', accepted: ['sofa', 'couch', 'settee'] },
      { file: 'A Flat Screen Television.jpg', accepted: ['tv', 'television', 'telly', 'screen'] },
      { file: 'Window.jpg', accepted: ['window'] },
      { file: 'Analog Clock.jpg', accepted: ['clock', 'wall clock'] },
      { file: 'Lamp.jpg', accepted: ['lamp', 'light', 'table lamp'] },
    ],
    actions: [
      { file: 'Close-up of child reading a book.jpg', accepted: ['read', 'reading', 'read a book'] },
      { file: 'Girl asleep with her smooth Collie.JPG', accepted: ['sleep', 'sleeping'] },
      { file: 'Woman writing on a notebook with a pen.jpg', accepted: ['write', 'writing'] },
      { file: 'An artist painting with brush.jpg', accepted: ['paint', 'painting'] },
      { file: 'Leicester Morris Dancers.jpg', accepted: ['dance', 'dancing'] },
    ],
  },
  {
    label: 'Banheiro & rotina',
    objects: [
      { file: 'Toothbrush x3 20050716 002.jpg', accepted: ['toothbrush', 'toothbrushes'] },
      { file: 'Towel.jpg', accepted: ['towel'] },
      { file: 'Mirror.jpg', accepted: ['mirror'] },
      { file: 'A bar of soap.jpg', accepted: ['soap', 'bar of soap'] },
      { file: '2022-05-23 20 03 23 Shower stall in the second floor master bathroom of a house along Aquetong Lane in the Mountainview section of Ewing Township, Mercer County, New Jersey.jpg', accepted: ['shower'] },
    ],
    actions: [
      { file: 'Jogging couple.jpg', accepted: ['run', 'running', 'jog', 'jogging'] },
      { file: 'Swimming.jpg', accepted: ['swim', 'swimming'] },
      { file: 'Walking.jpg', accepted: ['walk', 'walking'] },
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
