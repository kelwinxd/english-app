import { create } from 'zustand';

// Placeholder da Fase 0. O login de verdade (better-auth) entra na Fase 1;
// aqui só firmamos o formato do estado global com Zustand.
export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
