// Conteúdo do "Aprender" — etapa mínima: tópicos curados (estáticos), cada um
// com explicação curta + quiz de múltipla escolha. Sem backend/LLM.
// Depois isto vem do CEFR-J (gerado uma vez e revisado) e vai pro banco.

export type Level = 'A2' | 'B1' | 'B2';

export type Question = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string; // em pt-BR, mostrado após responder
};

export type Topic = {
  id: string;
  level: Level;
  title: string;
  summary: string;
  explanation: string; // explicação curta (pt-BR + exemplos em inglês)
  questions: Question[];
};

export const TOPICS: Topic[] = [
  {
    id: 'past-simple',
    level: 'A2',
    title: 'Past Simple',
    summary: 'Falar de ações terminadas no passado.',
    explanation:
      'Usamos o Past Simple para ações concluídas no passado. Verbos regulares ganham -ed ' +
      '(work → worked). Irregulares mudam a forma (go → went, have → had). Na negativa e ' +
      'pergunta usamos did + verbo no infinitivo: "I didn\'t go", "Did you go?".',
    questions: [
      {
        prompt: 'Yesterday I ___ to the market.',
        options: ['go', 'went', 'gone', 'going'],
        answerIndex: 1,
        explanation: '"go" é irregular: o passado é "went".',
      },
      {
        prompt: 'She ___ her homework last night.',
        options: ['finish', 'finishes', 'finished', 'finishing'],
        answerIndex: 2,
        explanation: 'Verbo regular no passado: finish → finished.',
      },
      {
        prompt: 'They ___ at the party.',
        options: ["wasn't", "weren't", "didn't were", 'not were'],
        answerIndex: 1,
        explanation: 'Plural "they" usa "were"; a negativa é "weren\'t".',
      },
      {
        prompt: '___ you call her yesterday?',
        options: ['Did', 'Do', 'Was', 'Were'],
        answerIndex: 0,
        explanation: 'Perguntas no passado simples usam "Did" + verbo base.',
      },
    ],
  },
  {
    id: 'articles',
    level: 'A2',
    title: 'Articles: a / an / the',
    summary: 'Quando usar a, an e the.',
    explanation:
      'Use "a" antes de som de consoante (a dog) e "an" antes de som de vogal (an apple). ' +
      'Use "the" para algo específico/já conhecido (the car we saw). Sem artigo para plurais ' +
      'gerais: "I like cats".',
    questions: [
      {
        prompt: 'I saw ___ elephant at the zoo.',
        options: ['a', 'an', 'the', '—'],
        answerIndex: 1,
        explanation: '"elephant" começa com som de vogal → "an".',
      },
      {
        prompt: 'She is ___ university student.',
        options: ['a', 'an', 'the', '—'],
        answerIndex: 0,
        explanation: '"university" tem som de "y" (consoante) → "a".',
      },
      {
        prompt: 'Can you close ___ door, please?',
        options: ['a', 'an', 'the', '—'],
        answerIndex: 2,
        explanation: 'Porta específica (aquela) → "the".',
      },
    ],
  },
  {
    id: 'present-perfect',
    level: 'B1',
    title: 'Present Perfect',
    summary: 'Experiências e ações com ligação com o presente.',
    explanation:
      'Formado por have/has + particípio (I have seen, she has gone). Usamos para experiências ' +
      '("I have been to Japan") e ações recentes com efeito no presente. Combina com "already", ' +
      '"yet", "ever", "never", "since", "for". Cuidado: "I have gone" ≠ "I went".',
    questions: [
      {
        prompt: 'I ___ this movie before.',
        options: ['saw', 'have seen', 'seen', 'have saw'],
        answerIndex: 1,
        explanation: 'have + particípio de "see" = "have seen".',
      },
      {
        prompt: 'She ___ finished her report yet.',
        options: ["hasn't", "haven't", "didn't", "doesn't"],
        answerIndex: 0,
        explanation: '"she" usa "has"; negativa com "yet" → "hasn\'t finished".',
      },
      {
        prompt: 'We have lived here ___ 2019.',
        options: ['for', 'since', 'ago', 'from'],
        answerIndex: 1,
        explanation: '"since" marca o ponto inicial (desde 2019). "for" seria duração.',
      },
      {
        prompt: 'Have you ___ been to London?',
        options: ['ever', 'yet', 'already', 'since'],
        answerIndex: 0,
        explanation: 'Em perguntas de experiência usamos "ever".',
      },
    ],
  },
  {
    id: 'comparatives',
    level: 'B1',
    title: 'Comparatives & Superlatives',
    summary: 'Comparar coisas (maior, o melhor…).',
    explanation:
      'Adjetivos curtos: +er / +est (fast → faster → the fastest). Longos: more / most ' +
      '(beautiful → more beautiful → the most beautiful). Irregulares: good → better → the best; ' +
      'bad → worse → the worst. Comparação usa "than": "taller than me".',
    questions: [
      {
        prompt: 'This car is ___ than mine.',
        options: ['fast', 'faster', 'fastest', 'more fast'],
        answerIndex: 1,
        explanation: 'Adjetivo curto + "than" → "faster than".',
      },
      {
        prompt: 'It was the ___ day of my life.',
        options: ['good', 'better', 'best', 'most good'],
        answerIndex: 2,
        explanation: 'Superlativo irregular de "good" → "the best".',
      },
      {
        prompt: 'This book is ___ interesting than that one.',
        options: ['more', 'most', 'much', 'the most'],
        answerIndex: 0,
        explanation: 'Adjetivo longo no comparativo → "more interesting than".',
      },
    ],
  },
];
