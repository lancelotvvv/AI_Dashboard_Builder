/**
 * Generates the full JSX source code for a widget based on its type and config.
 * The generated code is a function body that receives { config, data, width, height }
 * and has React, Recharts, and lucide-react in scope.
 */
export function generateWidgetCode(
  type: string,
  config: Record<string, unknown>,
): string {
  switch (type) {
    case 'kpi': return generateKpiCode(config)
    case 'chart': return generateChartCode(config)
    case 'table': return generateTableCode(config)
    case 'text': return generateTextCode(config)
    case 'filter': return generateFilterCode(config)
    case 'container': return '// Container widgets cannot be edited as code.\nreturn <div className="flex items-center justify-center h-full text-slate-400">Container</div>'
    default: return `return <div>Unknown widget type: ${type}</div>`
  }
}

function s(v: unknown): string {
  return JSON.stringify(v)
}

function generateKpiCode(config: Record<string, unknown>): string {
  const label = config.label ?? 'Value'
  const prefix = config.prefix ?? ''
  const suffix = config.suffix ?? ''
  const trendField = config.trendField ?? ''

  return `const rows = data?.rows ?? []
const valueField = Object.keys(rows[0] ?? {}).find(k => typeof rows[0]?.[k] === "number")
const value = valueField ? rows[0]?.[valueField] : null
${trendField ? `const trendValue = rows.length > 1 ? (rows[0]?.[${s(trendField)}]) - (rows[1]?.[${s(trendField)}]) : null` : 'const trendValue = null'}

return (
  <div className="flex flex-col items-center justify-center h-full p-4">
    <span className="text-sm text-slate-500">${label}</span>
    <span className="text-3xl font-bold mt-1 text-value-gradient">
      ${prefix}{value != null ? value.toLocaleString() : "—"}${suffix}
    </span>
    {trendValue != null && (
      <span className={\`flex items-center gap-1 text-sm mt-1 \${trendValue >= 0 ? "text-green-600" : "text-red-600"}\`}>
        {trendValue >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(trendValue).toLocaleString()}
      </span>
    )}
  </div>
)`
}

function generateChartCode(config: Record<string, unknown>): string {
  const chartType = (config.chartType as string) || 'bar'
  const xField = (config.xField as string) || ''
  const yField = (config.yField as string) || ''
  const color = (config.color as string) || '#3b82f6'

  const xExpr = xField ? s(xField) : 'data?.fields?.[0]?.name || ""'
  const yExpr = yField ? s(yField) : 'data?.fields?.find(f => f.type === "number")?.name || ""'

  const preamble = `const rows = data?.rows ?? []
const xField = ${xExpr}
const yField = ${yExpr}

if (!rows.length) {
  return <div className="flex items-center justify-center h-full text-gray-400">No data. Bind a dataset.</div>
}
`

  switch (chartType) {
    case 'pie':
      return `${preamble}
const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

return (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={rows} dataKey={yField} nameKey={xField} cx="50%" cy="50%" outerRadius="70%" label>
        {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
)`

    case 'donut':
      return `${preamble}
const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

return (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={rows} dataKey={yField} nameKey={xField} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" label>
        {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
)`

    case 'area':
      return `${preamble}
const color = ${s(color)}

return (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xField} fontSize={12} />
      <YAxis fontSize={12} />
      <Tooltip />
      <defs>
        <linearGradient id={\`areaGrad-\${color}\`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey={yField} stroke={color} strokeWidth={2} fill={\`url(#areaGrad-\${color})\`} />
    </AreaChart>
  </ResponsiveContainer>
)`

    case 'scatter':
      return `${preamble}
return (
  <ResponsiveContainer width="100%" height="100%">
    <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xField} fontSize={12} name={xField} />
      <YAxis dataKey={yField} fontSize={12} name={yField} />
      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
      <Scatter data={rows} fill={${s(color)}} />
    </ScatterChart>
  </ResponsiveContainer>
)`

    case 'stacked-bar':
      return `${preamble}
const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]
const numericFields = data?.fields?.filter(f => f.type === "number").map(f => f.name) ?? [yField]

return (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xField} fontSize={12} />
      <YAxis fontSize={12} />
      <Tooltip />
      <Legend />
      {numericFields.map((field, i) => (
        <Bar key={field} dataKey={field} stackId="stack" fill={COLORS[i % COLORS.length]} radius={i === numericFields.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
      ))}
    </BarChart>
  </ResponsiveContainer>
)`

    case 'line':
      return `${preamble}
return (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xField} fontSize={12} />
      <YAxis fontSize={12} />
      <Tooltip />
      <Line type="monotone" dataKey={yField} stroke={${s(color)}} strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
)`

    default: // bar
      return `${preamble}
return (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xField} fontSize={12} />
      <YAxis fontSize={12} />
      <Tooltip />
      <Bar dataKey={yField} fill={${s(color)}} radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
)`
  }
}

function generateTableCode(config: Record<string, unknown>): string {
  const columns = config.columns as string[] | undefined
  const pageSize = (config.pageSize as number) || 10

  return `const rows = data?.rows ?? []
const fields = data?.fields ?? []
const columns = ${columns?.length ? s(columns) : 'fields.map(f => f.name)'}
const pageSize = ${pageSize}
const [sortField, setSortField] = React.useState(null)
const [sortDir, setSortDir] = React.useState("asc")
const [page, setPage] = React.useState(0)

const sorted = React.useMemo(() => {
  if (!sortField) return rows
  return [...rows].sort((a, b) => {
    const av = a[sortField], bv = b[sortField]
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))
    return sortDir === "asc" ? cmp : -cmp
  })
}, [rows, sortField, sortDir])

const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)
const totalPages = Math.ceil(sorted.length / pageSize)

if (!rows.length) {
  return <div className="flex items-center justify-center h-full text-gray-400">No data</div>
}

return (
  <div className="h-full flex flex-col text-xs">
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-white/80 backdrop-blur-sm">
          <tr>
            {columns.map(col => (
              <th
                key={col}
                className="px-3 py-1.5 text-left font-medium text-slate-500 cursor-pointer hover:text-slate-700"
                onClick={() => {
                  if (sortField === col) setSortDir(d => d === "asc" ? "desc" : "asc")
                  else { setSortField(col); setSortDir("asc") }
                }}
              >
                {col} {sortField === col ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white/40" : ""}>
              {columns.map(col => (
                <td key={col} className="px-3 py-1.5 text-slate-600">{String(row[col] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {totalPages > 1 && (
      <div className="flex items-center justify-between px-3 py-1 border-t text-slate-400">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
        <span>{page + 1} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next →</button>
      </div>
    )}
  </div>
)`
}

function generateTextCode(config: Record<string, unknown>): string {
  const content = (config.content as string) || ''
  const fontSize = (config.fontSize as string) || 'base'

  return `return (
  <div className="p-4 h-full overflow-auto text-${fontSize} text-slate-700 whitespace-pre-wrap">
    ${s(content).slice(1, -1)}
  </div>
)`
}

function generateFilterCode(config: Record<string, unknown>): string {
  const displayType = (config.displayType as string) || 'dropdown'
  const field = (config.field as string) || ''
  const label = (config.label as string) || 'Filter'

  return `// Filter widget — ${displayType} for "${field}"
// Filter widgets use the global filter store and are best configured via the inspector.
const displayType = ${s(displayType)}
const field = ${s(field)}
const label = ${s(label)}

return (
  <div className="flex items-center gap-2 px-3 h-full">
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <span className="text-xs text-slate-400">({displayType} on "{field}")</span>
  </div>
)`
}
