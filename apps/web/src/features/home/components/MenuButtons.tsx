import { useNavigate } from 'react-router-dom';
import { BookOpen, Gamepad2, MessageCircle, type LucideIcon } from 'lucide-react';

type Pillar = {
  key: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
  to: string | null;
};

const PILLARS: Pillar[] = [
  { key: 'aprender', label: 'Aprender', hint: 'Lições CEFR-J + quiz', Icon: BookOpen, to: null },
  { key: 'jogar', label: 'Jogar', hint: 'Jogos com desafios do seu nível', Icon: Gamepad2, to: '/jogar' },
  { key: 'conversar', label: 'Conversar', hint: 'Áudio-chat com correção', Icon: MessageCircle, to: '/conversar' },
];

/** Os três botões principais da Home. Carrega os próprios dados e a navegação. */
export function MenuButtons() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col gap-4">
      {PILLARS.map(({ key, label, hint, Icon, to }) => (
        <button
          key={key}
          type="button"
          onClick={() => to && navigate(to)}
          disabled={!to}
          className="group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-60"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-semibold">
              {label}
              {!to && <span className="ml-2 text-xs font-normal text-muted-foreground">em breve</span>}
            </span>
            <span className="text-sm text-muted-foreground">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
