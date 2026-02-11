import { z } from 'zod'
import type { ToolCall, ToolResult } from './ai-service.interface'
import { useDashboardStore } from '@/store/dashboard.store'
import { genId } from '@/lib/utils'
import { WIDGET_TYPE_DEFAULTS } from '@/registry/widget-registry'
import { dummyDatasets } from '@/data/dummy-datasets'

const addFilterWidgetSchema = z.object({
  title: z.string().optional(),
  datasetId: z.string(),
  field: z.string(),
  displayType: z.enum(['dropdown', 'button-group', 'date-range']).optional(),
  options: z.array(z.union([z.string(), z.number()])).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
})

const addWidgetSchema = z.object({
  type: z.enum(['kpi', 'chart', 'table', 'text', 'filter']),
  title: z.string().optional(),
  config: z.record(z.unknown()).optional(),
  datasetId: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
})

const removeWidgetSchema = z.object({ id: z.string() })
const updateConfigSchema = z.object({ id: z.string(), config: z.record(z.unknown()) })
const updateTitleSchema = z.object({ id: z.string(), title: z.string() })
const setDataBindingSchema = z.object({ id: z.string(), datasetId: z.string() })
const updateLayoutSchema = z.object({
  id: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
})
const setNameSchema = z.object({ name: z.string() })

export function executeToolCall(call: ToolCall): ToolResult {
  const store = useDashboardStore.getState()

  try {
    switch (call.name) {
      case 'add_widget': {
        const p = addWidgetSchema.parse(call.params)
        const id = genId()
        const defaults = WIDGET_TYPE_DEFAULTS[p.type]
        const w = p.w ?? defaults?.defaultSize.w ?? 4
        const h = p.h ?? defaults?.defaultSize.h ?? 3
        const config = { ...(defaults?.defaultConfig ?? {}), ...(p.config ?? {}) }

        // Compute position
        const layout = store.spec.layout
        const maxY = layout.reduce((max, l) => Math.max(max, l.y + l.h), 0)
        const x = p.x ?? 0
        const y = p.y ?? maxY

        store.spec.widgets.push({
          id,
          type: p.type,
          title: p.title ?? `New ${p.type.charAt(0).toUpperCase() + p.type.slice(1)}`,
          config,
          ...(p.datasetId ? { dataBinding: { datasetId: p.datasetId, fieldMap: {}, filters: [] } } : {}),
        })
        store.spec.layout.push({ i: id, x, y, w, h })

        // Apply via setSpec to trigger reactivity
        useDashboardStore.getState().setSpec({ ...store.spec })
        return { success: true, data: { id } }
      }

      case 'add_filter_widget': {
        const p = addFilterWidgetSchema.parse(call.params)
        const id = genId()
        const defaults = WIDGET_TYPE_DEFAULTS['filter']
        const w = p.w ?? defaults?.defaultSize.w ?? 4
        const h = p.h ?? defaults?.defaultSize.h ?? 1
        const config = {
          ...(defaults?.defaultConfig ?? {}),
          datasetId: p.datasetId,
          field: p.field,
          ...(p.displayType ? { displayType: p.displayType } : {}),
          ...(p.options ? { options: p.options } : {}),
          ...(p.title ? { label: p.title } : {}),
        }

        const layout = store.spec.layout
        const maxY = layout.reduce((max, l) => Math.max(max, l.y + l.h), 0)
        const x = p.x ?? 0
        const y = p.y ?? maxY

        store.spec.widgets.push({
          id,
          type: 'filter' as any,
          title: p.title ?? 'Filter',
          config,
        })
        store.spec.layout.push({ i: id, x, y, w, h })
        useDashboardStore.getState().setSpec({ ...store.spec })
        return { success: true, data: { id } }
      }

      case 'remove_widget': {
        const p = removeWidgetSchema.parse(call.params)
        store.removeWidget(p.id)
        return { success: true }
      }

      case 'update_widget_config': {
        const p = updateConfigSchema.parse(call.params)
        store.updateWidgetConfig(p.id, p.config)
        return { success: true }
      }

      case 'update_widget_title': {
        const p = updateTitleSchema.parse(call.params)
        store.updateWidgetTitle(p.id, p.title)
        return { success: true }
      }

      case 'set_data_binding': {
        const p = setDataBindingSchema.parse(call.params)
        store.updateWidgetDataBinding(p.id, { datasetId: p.datasetId, fieldMap: {}, filters: [] })
        return { success: true }
      }

      case 'update_layout': {
        const p = updateLayoutSchema.parse(call.params)
        const layout = store.spec.layout.map(l => {
          if (l.i !== p.id) return l
          return { ...l, ...(p.x != null ? { x: p.x } : {}), ...(p.y != null ? { y: p.y } : {}), ...(p.w != null ? { w: p.w } : {}), ...(p.h != null ? { h: p.h } : {}) }
        })
        store.updateLayout(layout)
        return { success: true }
      }

      case 'set_dashboard_name': {
        const p = setNameSchema.parse(call.params)
        store.setName(p.name)
        return { success: true }
      }

      case 'list_widgets': {
        return { success: true, data: store.spec.widgets.map(w => ({ id: w.id, type: w.type, title: w.title })) }
      }

      case 'list_datasets': {
        return { success: true, data: dummyDatasets.map(d => ({ id: d.id, name: d.name, fields: d.fields })) }
      }

      case 'get_dashboard_spec': {
        return { success: true, data: store.spec }
      }

      default:
        return { success: false, error: `Unknown tool: ${call.name}` }
    }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
