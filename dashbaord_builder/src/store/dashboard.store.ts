import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type { DashboardSpec, LayoutItem, WidgetSpec, PageSettings } from '@/schemas/dashboard.schema'
import { dashboardSpecSchema } from '@/schemas/dashboard.schema'
import { genId } from '@/lib/utils'
import { WIDGET_TYPE_DEFAULTS } from '@/registry/widget-registry'

interface DashboardState {
  spec: DashboardSpec
  selectedWidgetId: string | null
  setSpec: (spec: DashboardSpec) => void
  setName: (name: string) => void
  addWidget: (type: WidgetSpec['type'], configOverrides?: Record<string, unknown>) => string
  removeWidget: (id: string) => void
  updateWidgetConfig: (id: string, config: Record<string, unknown>) => void
  updateWidgetTitle: (id: string, title: string) => void
  updateWidgetDataBinding: (id: string, binding: WidgetSpec['dataBinding']) => void
  updateWidgetCustomCode: (id: string, code: string | undefined) => void
  updateLayout: (layout: LayoutItem[]) => void
  updatePageSettings: (settings: Partial<PageSettings>) => void
  selectWidget: (id: string | null) => void
  newDashboard: () => void
}

function createEmptySpec(): DashboardSpec {
  return dashboardSpecSchema.parse({ id: genId(), name: 'Untitled Dashboard', version: 1, layout: [], widgets: [] })
}

// Separate store for UI-only selection state (not tracked by undo/redo)
interface UISelectionState {
  selectedCellIndex: number | null
  selectCell: (index: number | null) => void
}

export const useUISelectionStore = create<UISelectionState>()((set) => ({
  selectedCellIndex: null,
  selectCell: (index) => set({ selectedCellIndex: index }),
}))

export const useDashboardStore = create<DashboardState>()(
  temporal(
    immer((set) => ({
      spec: createEmptySpec(),
      selectedWidgetId: null,

      setSpec: (spec) => set((s) => { s.spec = dashboardSpecSchema.parse(spec) }),

      setName: (name) => set((s) => { s.spec.name = name }),

      addWidget: (type, configOverrides) => {
        const id = genId()
        const defaults = WIDGET_TYPE_DEFAULTS[type]
        set((s) => {
          const w = defaults?.defaultSize.w ?? 4
          const h = defaults?.defaultSize.h ?? 3
          const maxY = s.spec.layout.reduce((max, l) => Math.max(max, l.y + l.h), 0)
          s.spec.widgets.push({
            id,
            type,
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            config: { ...(defaults?.defaultConfig ?? {}), ...(configOverrides ?? {}) },
          })
          s.spec.layout.push({ i: id, x: 0, y: maxY, w, h })
          s.selectedWidgetId = id
        })
        useUISelectionStore.getState().selectCell(null)
        return id
      },

      removeWidget: (id) => set((s) => {
        s.spec.widgets = s.spec.widgets.filter(w => w.id !== id)
        s.spec.layout = s.spec.layout.filter(l => l.i !== id)
        if (s.selectedWidgetId === id) s.selectedWidgetId = null
      }),

      updateWidgetConfig: (id, config) => set((s) => {
        const w = s.spec.widgets.find(w => w.id === id)
        if (w) w.config = { ...w.config, ...config }
      }),

      updateWidgetTitle: (id, title) => set((s) => {
        const w = s.spec.widgets.find(w => w.id === id)
        if (w) w.title = title
      }),

      updateWidgetDataBinding: (id, binding) => set((s) => {
        const w = s.spec.widgets.find(w => w.id === id)
        if (w) w.dataBinding = binding
      }),

      updateWidgetCustomCode: (id, code) => set((s) => {
        const w = s.spec.widgets.find(w => w.id === id)
        if (w) w.customCode = code
      }),

      updateLayout: (layout) => set((s) => { s.spec.layout = layout }),

      updatePageSettings: (settings) => set((s) => {
        s.spec.pageSettings = { ...s.spec.pageSettings, ...settings }
      }),

      selectWidget: (id) => set((s) => {
        if (s.selectedWidgetId !== id) {
          useUISelectionStore.getState().selectCell(null)
        }
        s.selectedWidgetId = id
      }),

      newDashboard: () => set((s) => {
        const fresh = createEmptySpec()
        s.spec = fresh
        s.selectedWidgetId = null
      }),
    })),
    { limit: 50 }
  )
)
