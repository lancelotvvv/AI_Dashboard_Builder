import { z } from 'zod'

export const kpiConfigSchema = z.object({
  label: z.string().default('KPI'),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  trendField: z.string().optional(),
  color: z.string().default('#3b82f6'),
  valueField: z.string().default(''),
  fontSize: z.enum(['sm', 'base', 'lg', 'xl']).default('lg'),
  showTrend: z.boolean().default(true),
})
export type KpiConfig = z.infer<typeof kpiConfigSchema>

export const chartConfigSchema = z.object({
  chartType: z.enum(['bar', 'line', 'pie', 'area', 'stacked-bar', 'donut', 'scatter']).default('bar'),
  xField: z.string().default(''),
  yField: z.string().default(''),
  color: z.string().default('#3b82f6'),
  showLegend: z.boolean().default(false),
  showDataLabels: z.boolean().default(false),
  showGrid: z.boolean().default(true),
  showTooltip: z.boolean().default(true),
  sortOrder: z.enum(['none', 'asc', 'desc']).default('none'),
  xAxisLabel: z.string().default(''),
  yAxisLabel: z.string().default(''),
})
export type ChartConfig = z.infer<typeof chartConfigSchema>

export const tableConfigSchema = z.object({
  columns: z.array(z.string()).default([]),
  pageSize: z.number().default(10),
  striped: z.boolean().default(true),
  showRowNumbers: z.boolean().default(false),
  compact: z.boolean().default(false),
})
export type TableConfig = z.infer<typeof tableConfigSchema>

export const textConfigSchema = z.object({
  content: z.string().default('Enter text here...'),
  fontSize: z.enum(['sm', 'base', 'lg', 'xl', '2xl']).default('base'),
})
export type TextConfig = z.infer<typeof textConfigSchema>

export const cellDataBindingSchema = z.object({
  datasetId: z.string(),
  fieldMap: z.record(z.string(), z.string()).default({}),
  filters: z.array(z.object({
    field: z.string(),
    op: z.enum(['eq', 'neq', 'gt', 'lt', 'contains', 'gte', 'lte']),
    value: z.union([z.string(), z.number()]),
  })).default([]),
}).optional()

export const cellSpecSchema = z.object({
  type: z.string(),
  title: z.string().default(''),
  config: z.record(z.string(), z.unknown()).default({}),
  dataBinding: cellDataBindingSchema,
})
export type CellSpec = z.infer<typeof cellSpecSchema>

export const containerConfigSchema = z.object({
  cols: z.number().default(2),
  rows: z.number().default(2),
  cells: z.array(cellSpecSchema.nullable()).default([]),
})
export type ContainerConfig = z.infer<typeof containerConfigSchema>

export const filterConfigSchema = z.object({
  displayType: z.enum(['dropdown', 'button-group', 'date-range']).default('dropdown'),
  datasetId: z.string().default(''),
  field: z.string().default(''),
  label: z.string().default('Filter'),
  options: z.array(z.union([z.string(), z.number()])).default([]),
})
export type FilterConfig = z.infer<typeof filterConfigSchema>
