import { create } from 'zustand'

export interface ActiveFilter {
  field: string
  datasetId: string
  op: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'gte' | 'lte'
  value: string | number
}

interface FilterState {
  activeFilters: Map<string, ActiveFilter>
  setFilter: (widgetId: string, filter: ActiveFilter) => void
  clearFilter: (widgetId: string) => void
  clearAll: () => void
}

export const useFilterStore = create<FilterState>()((set) => ({
  activeFilters: new Map(),
  setFilter: (widgetId, filter) =>
    set((s) => {
      const next = new Map(s.activeFilters)
      next.set(widgetId, filter)
      return { activeFilters: next }
    }),
  clearFilter: (widgetId) =>
    set((s) => {
      const next = new Map(s.activeFilters)
      next.delete(widgetId)
      return { activeFilters: next }
    }),
  clearAll: () => set({ activeFilters: new Map() }),
}))
