import { z } from 'zod'

export const layoutItemSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
})
export type LayoutItem = z.infer<typeof layoutItemSchema>

export const dataBindingSchema = z.object({
  datasetId: z.string(),
  fieldMap: z.record(z.string(), z.string()).default({}),
  filters: z.array(z.object({
    field: z.string(),
    op: z.enum(['eq', 'neq', 'gt', 'lt', 'contains', 'gte', 'lte']),
    value: z.union([z.string(), z.number()]),
  })).default([]),
})
export type DataBinding = z.infer<typeof dataBindingSchema>

export const widgetSpecSchema = z.object({
  id: z.string(),
  type: z.enum(['kpi', 'chart', 'table', 'text', 'container', 'filter']),
  title: z.string().default('Untitled'),
  config: z.record(z.string(), z.unknown()).default({}),
  dataBinding: dataBindingSchema.optional(),
  customCode: z.string().optional(),
})
export type WidgetSpec = z.infer<typeof widgetSpecSchema>

export const pageSettingsSchema = z.object({
  layoutMode: z.enum(['scrollable', 'portrait-fixed', 'landscape-fixed']).default('scrollable'),
  pageWidth: z.number().default(1200),
  rowHeight: z.number().default(80),
})
export type PageSettings = z.infer<typeof pageSettingsSchema>

export const dashboardSpecSchema = z.object({
  id: z.string(),
  name: z.string().default('Untitled Dashboard'),
  version: z.literal(1).default(1),
  layout: z.array(layoutItemSchema).default([]),
  widgets: z.array(widgetSpecSchema).default([]),
  pageSettings: pageSettingsSchema.default({}),
})
export type DashboardSpec = z.infer<typeof dashboardSpecSchema>
