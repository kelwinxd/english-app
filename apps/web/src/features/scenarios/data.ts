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
};

export function menuImage(file: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=200`;
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
