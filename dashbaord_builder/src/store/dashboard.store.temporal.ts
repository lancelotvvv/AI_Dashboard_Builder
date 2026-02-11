import { useDashboardStore } from './dashboard.store'
import { useStore } from 'zustand'

export function useTemporalStore() {
  const store = useDashboardStore.temporal
  const undo = useStore(store, (s) => s.undo)
  const redo = useStore(store, (s) => s.redo)
  return { undo, redo }
}
