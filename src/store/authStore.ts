import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type UserRole = "estudiante" | "docente" | null;

interface AuthState {
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isRegistering: boolean;
  isRecuperandoPassword: boolean;
  isGoogleAuth: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRegistering: (isRegistering: boolean) => void;
  setIsRecuperandoPassword: (value: boolean) => void;
  setIsGoogleAuth: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  role: null,
  isLoading: true,
  isRegistering: false,
  isRecuperandoPassword: false,
  isGoogleAuth: false,
  setSession: (session) => set({ session }),
  setRole: (role) => set({ role }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsRegistering: (isRegistering) => set({ isRegistering }),
  setIsRecuperandoPassword: (value) => set({ isRecuperandoPassword: value }),
  setIsGoogleAuth: (value) => set({ isGoogleAuth: value }),
  clearAuth: () => set({ session: null, role: null }),
}));
