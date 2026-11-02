// "Treinar ocasiões": cenários de conversa guiada dentro do Conversar.
// MVP: só a lanchonete está ativa. A garçonete (persona) vive no backend como
// personagem oculto (id abaixo). Imagens do cardápio vêm do Wikimedia Commons
// (link direto) com emoji de fallback se a imagem falhar.

export type MenuItem = {
  en: string;
  pt: string;
  price: string;
  emoji: string;
  file: string; // arquivo no Wikimedia Commons
};

/** Opção de um select que define o escopo da conversa (ex.: área de trabalho). */
export type ScopeOption = { value: string; label: string };

export type Scenario = {
  id: string;
  label: string;
  emoji: string;
  available: boolean;
  characterId: string;
  characterName: string;
  avatar: string;
  place: string;
  background: string; // cena ao fundo (Wikimedia Commons)
  openingLine: string; // primeira fala do personagem (inglês)
  menu: MenuItem[];
  // Cenários com escopo escolhido antes de começar (ex.: Trabalho → área).
  // Os templates usam {scope} como placeholder da opção escolhida.
  scopeOptions?: ScopeOption[];
  scopeTitle?: string; // título do passo de seleção
  openingTemplate?: string; // fala de abertura com {scope}
  contextTemplate?: string; // escopo enviado à IA com {scope}
  speakOpening?: boolean; // lê a fala de abertura em voz alta (TTS)
  // Fundo específico por escopo (ex.: cada área de trabalho tem sua cena).
  // Cai no `background` padrão quando a área não estiver no mapa.
  scopeBackgrounds?: Record<string, string>;
};

/** Fundo efetivo do cenário, considerando o escopo escolhido. */
export function scenarioBackground(scenario: Scenario, scope?: string): string {
  if (scope && scenario.scopeBackgrounds?.[scope]) return scenario.scopeBackgrounds[scope];
  return scenario.background;
}

export function menuImage(file: string, width = 200) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'diner',
    label: 'Lanchonete',
    emoji: '🍔',
    available: true,
    characterId: 'diner-waitress',
    characterName: 'Sofia',
    avatar: 'https://i.pravatar.cc/150?img=45',
    place: "Sunny's Diner",
    background: 'Waitress.jpg',
    openingLine: "Hi there! Welcome to Sunny's Diner. What can I get you today?",
    menu: [
      { en: 'Coffee', pt: 'café', price: '$3', emoji: '☕', file: 'A small cup of coffee.JPG' },
      { en: 'Orange juice', pt: 'suco de laranja', price: '$4', emoji: '🧃', file: 'Orange juice 1.jpg' },
      { en: 'Water', pt: 'água', price: '$2', emoji: '💧', file: 'Glass of water.jpg' },
      { en: 'Sandwich', pt: 'sanduíche', price: '$6', emoji: '🥪', file: 'Sandwich.jpg' },
      { en: 'Hamburger', pt: 'hambúrguer', price: '$8', emoji: '🍔', file: 'Hamburger (black bg).jpg' },
      { en: 'Cake', pt: 'bolo', price: '$5', emoji: '🍰', file: 'Chocolate cake with chocolate frosting topped with chocolate.jpg' },
    ],
  },
  {
    id: 'bar',
    label: 'Bar',
    emoji: '🍻',
    available: false,
    characterId: '',
    characterName: '',
    avatar: '',
    place: '',
    background: '',
    openingLine: '',
    menu: [],
  },
  {
    id: 'work',
    label: 'Trabalho',
    emoji: '💼',
    available: true,
    characterId: 'work-colleague',
    characterName: 'Alex',
    avatar: 'https://i.pravatar.cc/150?img=12',
    place: 'Escritório',
    background: 'Coworking space.jpg',
    openingLine: '', // gerado a partir da área escolhida (openingTemplate)
    menu: [],
    scopeTitle: 'Em que área vocês trabalham?',
    scopeOptions: [
      { value: 'sales', label: 'Vendas' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'IT', label: 'TI' },
      { value: 'commercial', label: 'Comercial' },
      { value: 'finance', label: 'Financeiro' },
      { value: 'customer support', label: 'Atendimento' },
      { value: 'human resources', label: 'RH' },
      { value: 'operations', label: 'Operações' },
    ],
    openingTemplate:
      "Hey! Good to see you. Ready to keep working on our {scope} project? " +
      'I had a couple of ideas I wanted to run by you.',
    contextTemplate:
      'You and the user are coworkers working together on a {scope} project. ' +
      'Keep the whole conversation about work in {scope}: tasks, deadlines, ideas, ' +
      'the project status and office small talk. Use realistic {scope} vocabulary.',
    speakOpening: true,
    // Cena certa por profissão (Wikimedia Commons). Áreas fora do mapa usam o
    // fundo padrão (coworking).
    scopeBackgrounds: {
      sales: 'Provision Shop Riangdo South West Khasi Oct24 A7CR 04231.jpg',
      marketing:
        'Vialiki Voz Conference 2025 Pärnumaa Presentation at the conference (BW photo).jpg',
      IT: 'Software Developer at Work.jpg',
      commercial: 'Meeting.jpg',
      'customer support': 'Call Center Agent.jpg',
      'human resources': 'Job interview.jpg',
      operations: 'Worker installs a glass panel in a warehouse.jpg',
    },
  },
  {
    id: 'college',
    label: 'Faculdade',
    emoji: '🎓',
    available: false,
    characterId: '',
    characterName: '',
    avatar: '',
    place: '',
    background: '',
    openingLine: '',
    menu: [],
  },
];
