import { create } from "zustand";
import { api } from "@/lib/api";
import { getToken, removeToken, setToken } from "@/lib/auth";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { email: string; username: string; password: string; displayName?: string }) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, user } = response.data.data;
    setToken(accessToken);
    set({ token: accessToken, user, isAuthenticated: true });
  },
  signup: async (payload) => {
    const response = await api.post("/auth/signup", payload);
    const { accessToken, user } = response.data.data;
    setToken(accessToken);
    set({ token: accessToken, user, isAuthenticated: true });
  },
  loadMe: async () => {
    const token = getToken();
    if (!token) return;
    const response = await api.get("/auth/me");
    set({ token, user: response.data.data, isAuthenticated: true });
  },
  logout: () => {
    removeToken();
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
