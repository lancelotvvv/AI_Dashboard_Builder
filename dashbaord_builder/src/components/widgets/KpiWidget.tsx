import type { WidgetProps } from '@/registry/widget-registry'
import type { KpiConfig } from '@/schemas/widget-configs.schema'
import { TrendingUp, TrendingDown } from 'lucide-react'

const FONT_SIZES = { sm: 'text-xl', base: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' } as const

export function KpiWidget({ config, data }: WidgetProps) {
  const c = config as KpiConfig
  const rows = data?.rows ?? []

  // Use explicit valueField or auto-detect first numeric field
  const valueField = c.valueField || Object.keys(rows[0] ?? {}).find(k => typeof rows[0]?.[k] === 'number')
  const value = valueField ? (rows[0]?.[valueField] as number) : null
  const trendValue = c.showTrend && c.trendField && rows.length > 1
    ? (rows[0]?.[c.trendField] as number) - (rows[1]?.[c.trendField] as number)
    : null

  const fontSize = FONT_SIZES[c.fontSize ?? 'lg'] ?? FONT_SIZES.lg

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <span className="text-sm text-slate-500">{c.label}</span>
      <span className={`${fontSize} font-bold mt-1`} style={{ color: c.color || undefined }}>
        {c.prefix}{value != null ? value.toLocaleString() : '—'}{c.suffix}
      </span>
      {trendValue != null && (
        <span className={`flex items-center gap-1 text-sm mt-1 ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trendValue >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trendValue).toLocaleString()}
        </span>
      )}
    </div>
  )
}
