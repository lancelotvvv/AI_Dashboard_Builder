import { useMemo } from 'react'
import type { WidgetProps } from '@/registry/widget-registry'
import type { ChartConfig } from '@/schemas/widget-configs.schema'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, LabelList,
} from 'recharts'

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function ChartWidget({ config, data }: WidgetProps) {
  const c = config as ChartConfig
  const rawRows = data?.rows ?? []
  const xField = c.xField || data?.fields?.[0]?.name || ''
  const yField = c.yField || data?.fields?.find(f => f.type === 'number')?.name || ''

  // Sort data if configured
  const rows = useMemo(() => {
    if (c.sortOrder === 'none' || !yField) return rawRows
    const sorted = [...rawRows]
    sorted.sort((a, b) => {
      const av = a[yField] as number, bv = b[yField] as number
      return c.sortOrder === 'asc' ? av - bv : bv - av
    })
    return sorted
  }, [rawRows, c.sortOrder, yField])

  if (!rows.length) {
    return <div className="flex items-center justify-center h-full text-gray-400">No data. Bind a dataset.</div>
  }

  const grid = c.showGrid ? <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /> : null
  const tooltip = c.showTooltip ? <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} /> : null
  const legend = c.showLegend ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null
  const dataLabelProps = c.showDataLabels ? { position: 'top' as const, fontSize: 10, fill: '#64748b' } : undefined

  const xAxisLabel = c.xAxisLabel ? <Label value={c.xAxisLabel} position="insideBottom" offset={-2} fontSize={11} fill="#94a3b8" /> : null
  const yAxisLabel = c.yAxisLabel ? <Label value={c.yAxisLabel} angle={-90} position="insideLeft" offset={10} fontSize={11} fill="#94a3b8" /> : null

  if (c.chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey={yField} nameKey={xField} cx="50%" cy="50%" outerRadius="70%" label={c.showDataLabels}>
            {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          {tooltip}
          {legend}
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (c.chartType === 'donut') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey={yField} nameKey={xField} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" label={c.showDataLabels}>
            {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          {tooltip}
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (c.chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: c.xAxisLabel ? 20 : 0 }}>
          {grid}
          <XAxis dataKey={xField} fontSize={12} tickLine={false}>{xAxisLabel}</XAxis>
          <YAxis fontSize={12} tickLine={false}>{yAxisLabel}</YAxis>
          {tooltip}
          {legend}
          <defs>
            <linearGradient id={`areaGrad-${c.color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={c.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={c.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={yField} stroke={c.color} strokeWidth={2} fill={`url(#areaGrad-${c.color})`}>
            {dataLabelProps && <LabelList dataKey={yField} {...dataLabelProps} />}
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (c.chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: c.xAxisLabel ? 20 : 0 }}>
          {grid}
          <XAxis dataKey={xField} fontSize={12} name={xField} tickLine={false}>{xAxisLabel}</XAxis>
          <YAxis dataKey={yField} fontSize={12} name={yField} tickLine={false}>{yAxisLabel}</YAxis>
          {tooltip}
          {legend}
          <Scatter data={rows} fill={c.color} />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  if (c.chartType === 'stacked-bar') {
    const numericFields = data?.fields?.filter(f => f.type === 'number').map(f => f.name) ?? [yField]
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: c.xAxisLabel ? 20 : 0 }}>
          {grid}
          <XAxis dataKey={xField} fontSize={12} tickLine={false}>{xAxisLabel}</XAxis>
          <YAxis fontSize={12} tickLine={false}>{yAxisLabel}</YAxis>
          {tooltip}
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {numericFields.map((field, i) => (
            <Bar key={field} dataKey={field} stackId="stack" fill={COLORS[i % COLORS.length]} radius={i === numericFields.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}>
              {dataLabelProps && i === numericFields.length - 1 && <LabelList dataKey={field} {...dataLabelProps} />}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (c.chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: c.xAxisLabel ? 20 : 0 }}>
          {grid}
          <XAxis dataKey={xField} fontSize={12} tickLine={false}>{xAxisLabel}</XAxis>
          <YAxis fontSize={12} tickLine={false}>{yAxisLabel}</YAxis>
          {tooltip}
          {legend}
          <Line type="monotone" dataKey={yField} stroke={c.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }}>
            {dataLabelProps && <LabelList dataKey={yField} {...dataLabelProps} />}
          </Line>
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: c.showDataLabels ? 20 : 10, right: 20, left: 0, bottom: c.xAxisLabel ? 20 : 0 }}>
        {grid}
        <XAxis dataKey={xField} fontSize={12} tickLine={false}>{xAxisLabel}</XAxis>
        <YAxis fontSize={12} tickLine={false}>{yAxisLabel}</YAxis>
        {tooltip}
        {legend}
        <Bar dataKey={yField} fill={c.color} radius={[4, 4, 0, 0]}>
          {dataLabelProps && <LabelList dataKey={yField} {...dataLabelProps} />}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
