import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  setToken: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null }),
}))
