import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

// Access-token lever kun i minne (ikke localStorage) for å redusere XSS-eksponering.
// Refresh-token ligger i en httpOnly-cookie satt av backend og er ikke synlig for JS.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: null }),
}));
