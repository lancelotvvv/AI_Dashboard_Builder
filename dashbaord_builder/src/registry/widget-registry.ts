import type { z } from 'zod'
import type { ComponentType } from 'react'
import { kpiConfigSchema, chartConfigSchema, tableConfigSchema, textConfigSchema, containerConfigSchema, filterConfigSchema } from '@/schemas/widget-configs.schema'
import type { DataResult } from '@/providers/data-provider.interface'

export interface WidgetProps {
  config: Record<string, unknown>
  data: DataResult | null
  width: number
  height: number
}

export interface WidgetRegistryEntry {
  type: string
  label: string
  icon: string
  configSchema: z.ZodType
  defaultConfig: Record<string, unknown>
  component: ComponentType<WidgetProps>
  defaultSize: { w: number; h: number }
}

const registry = new Map<string, WidgetRegistryEntry>()

export function registerWidget(entry: WidgetRegistryEntry) {
  registry.set(entry.type, entry)
}

export function getWidgetEntry(type: string): WidgetRegistryEntry | undefined {
  return registry.get(type)
}

export function getAllWidgetTypes(): WidgetRegistryEntry[] {
  return Array.from(registry.values())
}

export function getDefaultConfig(type: string): Record<string, unknown> {
  return registry.get(type)?.defaultConfig ?? {}
}

export function getConfigSchema(type: string): z.ZodType | undefined {
  return registry.get(type)?.configSchema
}

// Register defaults for each type - components assigned later to avoid circular imports
export const WIDGET_TYPE_DEFAULTS: Record<string, { schema: z.ZodType; defaultConfig: Record<string, unknown>; defaultSize: { w: number; h: number } }> = {
  kpi: { schema: kpiConfigSchema, defaultConfig: kpiConfigSchema.parse({}), defaultSize: { w: 3, h: 2 } },
  chart: { schema: chartConfigSchema, defaultConfig: chartConfigSchema.parse({}), defaultSize: { w: 6, h: 4 } },
  table: { schema: tableConfigSchema, defaultConfig: tableConfigSchema.parse({}), defaultSize: { w: 6, h: 4 } },
  text: { schema: textConfigSchema, defaultConfig: textConfigSchema.parse({}), defaultSize: { w: 4, h: 2 } },
  container: { schema: containerConfigSchema, defaultConfig: containerConfigSchema.parse({}), defaultSize: { w: 6, h: 4 } },
  filter: { schema: filterConfigSchema, defaultConfig: filterConfigSchema.parse({}), defaultSize: { w: 4, h: 1 } },
}
