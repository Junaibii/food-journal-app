import { create } from "zustand";
import type { User } from "@/types";
import { storage } from "@/services/storage";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  /**
   * Called on login — persists the token to SecureStore (fire-and-forget)
   * so we never have to thread async through every call site.
   */
  setAuth: (user: User, token: string) => void;
  /**
   * Called on boot to restore a previously persisted session.
   * Does NOT re-write to SecureStore (token already lives there).
   */
  restoreAuth: (user: User, token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  /**
   * Called on logout — clears state and removes the token from SecureStore.
   */
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user, token) => {
    set({ user, token });
    // Intentionally not awaited — write is fast and we don't need to block.
    storage.saveToken(token);
  },

  restoreAuth: (user, token) => set({ user, token }),

  updateUser: (partial) =>
    set((s) => ({ user: s.user ? { ...s.user, ...partial } : s.user })),

  clearAuth: () => {
    set({ user: null, token: null });
    storage.deleteToken();
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
