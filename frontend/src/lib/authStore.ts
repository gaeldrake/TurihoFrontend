import { create } from 'zustand';
import { setAuthTokenGetter } from './apiClient';

/**
 * Store d'authentification minimal (zustand) — état SESSION uniquement
 * (les données serveur restent dans TanStack Query).
 *
 * ⚠️ Le backend Flask n'existe pas encore dans ce dépôt : le mécanisme réel
 * (cookie de session vs Bearer JWT) est [À CONFIRMER]. Ce store fournit le
 * point d'intégration unique ; la sécurité réelle reste côté backend.
 */
export type UserRole = 'guest' | 'member' | 'admin';

interface AuthState {
  token: string | null;
  role: UserRole;
  signIn: (token: string, role: UserRole) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: 'guest',
  signIn: (token, role) => set({ token, role }),
  signOut: () => set({ token: null, role: 'guest' }),
}));

// Injection du jeton dans le client API centralisé.
setAuthTokenGetter(() => useAuthStore.getState().token);

/** Sélecteurs pratiques pour l'UI (masquer ≠ sécuriser : le backend vérifie). */
export const useIsAuthenticated = () => useAuthStore((s) => s.token !== null);
export const useIsAdmin = () => useAuthStore((s) => s.role === 'admin');
