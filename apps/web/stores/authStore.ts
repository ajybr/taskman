import { create } from "zustand";
import type { User } from "@repo/types";
import { api } from "@/lib/api";
import { setStoredUser, setStoredToken, getStoredUser } from "@/lib/axios";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: () => {
    const storedUser = getStoredUser();
    set({
      user: storedUser,
      isAuthenticated: !!storedUser,
      isLoading: false,
    });
  },

  login: async (email: string, password: string) => {
    const { user, token } = await api.auth.login(email, password);
    setStoredToken(token);
    setStoredUser(user);
    set({ user, isAuthenticated: true });
  },

  signup: async (name: string, email: string, password: string) => {
    const { user, token } = await api.auth.signup(name, email, password);
    setStoredToken(token);
    setStoredUser(user);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await api.auth.logout();
    setStoredToken(null);
    setStoredUser(null);
    set({ user: null, isAuthenticated: false });
  },
}));