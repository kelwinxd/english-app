// Conteúdo do "Aprender": cada tópico tem TEORIA (blocos de leitura) + QUIZ.
// Conteúdo curado com base em gramática de referência. Sem backend/LLM.
// Depois vem do CEFR-J (gerado uma vez e revisado) e vai pro banco.

export type Level = 'A2' | 'B1' | 'B2';

// Blocos de teoria (leitura). `k` é o tipo do bloco.
export type Block =
  | { k: 'h'; text: string } // subtítulo
  | { k: 'p'; text: string } // parágrafo
  | { k: 'list'; items: string[] }
  | { k: 'ex'; items: string[] } // frases de exemplo (inglês)
  | { k: 'table'; headers: string[]; rows: string[][] }
  | { k: 'tip'; text: string }; // dica / cuidado

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
  content: Block[]; // teoria (leitura)
  questions: Question[]; // quiz
};

export const TOPICS: Topic[] = [
  {
    id: 'past-simple',
    level: 'A2',
    title: 'Past Simple',
    summary: 'Falar de ações terminadas no passado.',
    content: [
      { k: 'p', text: 'O Past Simple descreve ações concluídas num momento definido do passado — ontem, no ano passado, em 2010.' },
      { k: 'ex', items: ['I visited my grandma yesterday.', 'We watched a movie last night.'] },
      { k: 'h', text: 'Forma (verbos regulares e irregulares)' },
      {
        k: 'table',
        headers: ['', 'Afirmativa', 'Negativa', 'Pergunta'],
        rows: [
          ['Regular', 'I worked', "I didn't work", 'Did you work?'],
          ['Irregular', 'I went', "I didn't go", 'Did you go?'],
        ],
      },
      { k: 'p', text: 'Regulares terminam em -ed. Atenção à ortografia: study → studied, stop → stopped, like → liked.' },
      { k: 'p', text: 'Irregulares mudam a forma e precisam ser memorizados: go → went, have → had, see → saw, make → made.' },
      { k: 'h', text: 'Verbo "to be" (was / were)' },
      {
        k: 'table',
        headers: ['Sujeito', 'Afirmativa', 'Negativa'],
        rows: [
          ['I / he / she / it', 'was', "wasn't"],
          ['you / we / they', 'were', "weren't"],
        ],
      },
      { k: 'ex', items: ['She was tired.', 'They were at home.', 'Were you there?'] },
      { k: 'tip', text: 'Na negativa e na pergunta, "did" já marca o passado → o verbo principal fica no infinitivo. Diga "Did you go?" (nunca "Did you went?").' },
    ],
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
    content: [
      { k: 'h', text: 'Indefinidos: a / an' },
      { k: 'p', text: '"a" e "an" significam "um/uma" e se usam com substantivos contáveis no singular, para algo não específico ou mencionado pela primeira vez.' },
      { k: 'p', text: 'A escolha depende do SOM, não da letra: "a" antes de som de consoante, "an" antes de som de vogal.' },
      { k: 'ex', items: ['a dog, a car, a university (som de "yu")', 'an apple, an hour (o "h" é mudo), an MBA'] },
      { k: 'h', text: 'Definido: the' },
      { k: 'p', text: 'Use "the" para algo específico, único ou já conhecido/mencionado. Vale para singular e plural.' },
      { k: 'ex', items: ['Close the door, please.', 'The sun is bright.', 'I read the book you gave me.'] },
      { k: 'h', text: 'Artigo zero (sem artigo)' },
      {
        k: 'list',
        items: [
          'Plurais e incontáveis em sentido geral: "I like music", "Cats are cute".',
          'Nomes de pessoas, a maioria de cidades e países: "I live in Brazil".',
          'Refeições, idiomas, esportes: "I have lunch", "She speaks English".',
        ],
      },
      { k: 'tip', text: 'Regra do som: diga "an hour" (h mudo → som de vogal) e "a university" (som de "yu" → consoante).' },
    ],
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
    content: [
      { k: 'h', text: 'Forma: have / has + particípio passado' },
      {
        k: 'table',
        headers: ['', 'Afirmativa', 'Negativa', 'Pergunta'],
        rows: [
          ['I / you / we / they', 'have seen', "haven't seen", 'Have you seen?'],
          ['he / she / it', 'has seen', "hasn't seen", 'Has she seen?'],
        ],
      },
      { k: 'h', text: 'Quando usar' },
      {
        k: 'list',
        items: [
          'Experiências de vida (sem dizer quando): "I have been to Japan".',
          'Ação do passado com resultado no presente: "I have lost my keys" (ainda estão perdidas).',
          'Algo que começou no passado e continua: "She has lived here for 3 years".',
          'Passado recente com just / already / yet: "I have just eaten", "Have you finished yet?".',
        ],
      },
      { k: 'h', text: 'Present Perfect × Past Simple' },
      { k: 'p', text: 'Use Present Perfect quando o TEMPO não é definido ou ainda importa agora. Use Past Simple quando o tempo é definido e fechado (yesterday, in 2010, last week).' },
      { k: 'ex', items: ['I have visited Paris. (em algum momento da vida)', 'I visited Paris in 2019. (tempo definido → Past Simple)'] },
      { k: 'tip', text: 'for = duração ("for 3 years"); since = ponto de início ("since 2019"). E cuidado: "I have gone" (fui e não voltei) ≠ "I went" (passado simples).' },
    ],
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
    content: [
      { k: 'h', text: 'Comparativo (comparar dois)' },
      {
        k: 'table',
        headers: ['Adjetivo', 'Comparativo'],
        rows: [
          ['curto (fast)', 'faster than'],
          ['longo (expensive)', 'more expensive than'],
        ],
      },
      { k: 'ex', items: ['My car is faster than yours.', 'This phone is more expensive than that one.'] },
      { k: 'h', text: 'Superlativo (o mais de todos)' },
      {
        k: 'table',
        headers: ['Adjetivo', 'Superlativo'],
        rows: [
          ['curto (fast)', 'the fastest'],
          ['longo (expensive)', 'the most expensive'],
        ],
      },
      { k: 'ex', items: ['He is the fastest runner.', 'It was the most expensive meal of my life.'] },
      { k: 'h', text: 'Regras de formação' },
      {
        k: 'list',
        items: [
          '1 sílaba: + -er / -est (tall → taller → the tallest).',
          'Terminados em -y: -y vira -ier / -iest (happy → happier → the happiest).',
          'Longos (2+ sílabas): more / most (careful → more careful → the most careful).',
        ],
      },
      { k: 'h', text: 'Irregulares' },
      {
        k: 'table',
        headers: ['Adjetivo', 'Comparativo', 'Superlativo'],
        rows: [
          ['good', 'better', 'the best'],
          ['bad', 'worse', 'the worst'],
          ['far', 'further / farther', 'the furthest / farthest'],
        ],
      },
      { k: 'tip', text: 'No comparativo use "than"; no superlativo use "the". Ex.: "taller than me", "the tallest in the class".' },
    ],
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
