import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type UserRole = "estudiante" | "docente" | null;

interface AuthState {
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  role: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setRole: (role) => set({ role }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ session: null, role: null }),
}));
