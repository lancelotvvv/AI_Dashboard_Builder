import { create } from 'zustand'

interface DeveloperState {
  devMode: boolean
  toggleDevMode: () => void
}

export const useDeveloperStore = create<DeveloperState>()((set) => ({
  devMode: false,
  toggleDevMode: () => set((s) => ({ devMode: !s.devMode })),
}))
