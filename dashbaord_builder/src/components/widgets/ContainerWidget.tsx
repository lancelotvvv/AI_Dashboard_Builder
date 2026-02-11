import { useState, useMemo } from 'react'
import type { WidgetProps } from '@/registry/widget-registry'
import type { ContainerConfig, CellSpec } from '@/schemas/widget-configs.schema'
import { getWidgetEntry, WIDGET_TYPE_DEFAULTS } from '@/registry/widget-registry'
import { useDashboardStore, useUISelectionStore } from '@/store/dashboard.store'
import { useDeveloperStore } from '@/store/developer.store'
import { useIsViewMode } from '@/components/viewer/ViewerContext'
import { useWidgetData } from '@/store/hooks/useWidgetData'
import { generateWidgetCode } from '@/lib/code-gen'
import { validateCustomCode, compileCustomWidget } from '@/lib/code-runner'
import {
  Plus, X, Loader2, Code, Eye, RotateCcw,
  TrendingUp, BarChart3, Table, Type,
  BarChart, LineChart, PieChart, AreaChart, ScatterChart,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const widgetOptions: { type: string; label: string; icon: LucideIcon; config?: Record<string, unknown> }[] = [
  { type: 'kpi', label: 'KPI', icon: TrendingUp },
  { type: 'chart', label: 'Bar Chart', icon: BarChart, config: { chartType: 'bar' } },
  { type: 'chart', label: 'Line Chart', icon: LineChart, config: { chartType: 'line' } },
  { type: 'chart', label: 'Area Chart', icon: AreaChart, config: { chartType: 'area' } },
  { type: 'chart', label: 'Pie Chart', icon: PieChart, config: { chartType: 'pie' } },
  { type: 'chart', label: 'Donut', icon: PieChart, config: { chartType: 'donut' } },
  { type: 'chart', label: 'Stacked Bar', icon: BarChart3, config: { chartType: 'stacked-bar' } },
  { type: 'chart', label: 'Scatter', icon: ScatterChart, config: { chartType: 'scatter' } },
  { type: 'table', label: 'Table', icon: Table },
  { type: 'text', label: 'Text', icon: Type },
]

interface ContainerWidgetProps extends WidgetProps {
  widgetId?: string
  onConfigChange?: (config: Record<string, unknown>) => void
}

export function ContainerWidget({ config, data, onConfigChange, widgetId }: ContainerWidgetProps) {
  const c = config as ContainerConfig
  const cols = Math.max(1, Math.min(c.cols, 6))
  const rows = Math.max(1, Math.min(c.rows, 6))
  const totalCells = cols * rows
  const [pickerCell, setPickerCell] = useState<number | null>(null)
  const selectCell = useUISelectionStore(s => s.selectCell)
  const selectedCellIndex = useUISelectionStore(s => s.selectedCellIndex)
  const selectWidget = useDashboardStore(s => s.selectWidget)
  const viewMode = useIsViewMode()

  const cells: (CellSpec | null)[] = Array.from({ length: totalCells }, (_, i) => c.cells?.[i] ?? null)

  function setCell(index: number, cell: CellSpec | null) {
    const newCells = [...cells]
    newCells[index] = cell
    onConfigChange?.({ ...config, cells: newCells })
  }

  function updateCellCustomCode(index: number, code: string | undefined) {
    const cell = cells[index]
    if (!cell) return
    const newCells = [...cells]
    newCells[index] = { ...cell, config: { ...cell.config, _customCode: code } }
    onConfigChange?.({ ...config, cells: newCells })
  }

  function handlePick(index: number, option: typeof widgetOptions[number]) {
    const defaults = WIDGET_TYPE_DEFAULTS[option.type]
    const cell: CellSpec = {
      type: option.type,
      title: option.label,
      config: { ...(defaults?.defaultConfig ?? {}), ...(option.config ?? {}) },
    }
    setCell(index, cell)
    setPickerCell(null)
    if (widgetId) selectWidget(widgetId)
    selectCell(index)
  }

  function handleCellClick(index: number, e: React.MouseEvent) {
    e.stopPropagation()
    if (widgetId) selectWidget(widgetId)
    selectCell(cells[index] ? index : null)
  }

  return (
    <div
      className="h-full w-full p-2 grid gap-2 relative"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className={`rounded-lg border min-h-0 overflow-hidden relative transition-colors ${
            cell && selectedCellIndex === i
              ? 'border-tech-purple bg-tech-purple/5 border-solid'
              : 'border-dashed border-slate-200 bg-paper-50/30'
          }`}
          onClick={(e) => !viewMode && handleCellClick(i, e)}
        >
          {cell ? (
            <FilledCell
              cell={cell}
              data={data}
              onRemove={viewMode ? undefined : () => { setCell(i, null); selectCell(null) }}
              onCustomCodeChange={viewMode ? undefined : (code) => updateCellCustomCode(i, code)}
            />
          ) : !viewMode ? (
            <button
              className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-tech-blue hover:bg-white/40 transition-colors"
              onClick={(e) => { e.stopPropagation(); setPickerCell(i) }}
            >
              <Plus size={20} />
              <span className="text-[10px]">Add widget</span>
            </button>
          ) : null}

          {!viewMode && pickerCell === i && (
            <div
              className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 shadow-lg overflow-y-auto p-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Pick widget</span>
                <button onClick={() => setPickerCell(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {widgetOptions.map((opt, j) => (
                  <button
                    key={j}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-slate-600 hover:bg-tech-blue/10 hover:text-tech-blue transition-colors text-left"
                    onClick={() => handlePick(i, opt)}
                  >
                    <opt.icon size={12} />
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function FilledCell({ cell, data, onRemove, onCustomCodeChange }: {
  cell: CellSpec
  data: WidgetProps['data']
  onRemove?: () => void
  onCustomCodeChange?: (code: string | undefined) => void
}) {
  const entry = getWidgetEntry(cell.type)
  const { data: cellOwnData, isLoading } = useWidgetData(cell.dataBinding ?? undefined)
  const devMode = useDeveloperStore(s => s.devMode)
  const [codeMode, setCodeMode] = useState(false)

  const cellData = cell.dataBinding?.datasetId ? (cellOwnData ?? null) : data
  const customCode = cell.config?._customCode as string | undefined

  // Compile custom code if present
  const CustomComponent = useMemo(
    () => customCode ? compileCustomWidget(customCode) : null,
    [customCode],
  )

  if (!entry && !CustomComponent) return <div className="p-2 text-xs text-red-400">Unknown: {cell.type}</div>

  const Component = entry?.component

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-0.5 shrink-0">
        <span className="text-[10px] text-slate-400 truncate">
          {cell.title}
          {customCode && !codeMode && <span className="ml-1 text-[8px] text-tech-purple bg-tech-purple/10 rounded px-0.5">custom</span>}
        </span>
        <div className="flex items-center gap-0.5">
          {devMode && onCustomCodeChange && (
            <button
              className={`p-0.5 rounded transition-colors ${codeMode ? 'bg-tech-blue/10 text-tech-blue' : 'hover:bg-white/50 text-slate-300'}`}
              onClick={(e) => { e.stopPropagation(); setCodeMode(!codeMode) }}
              onMouseDown={(e) => e.stopPropagation()}
              title={codeMode ? 'Visual mode' : 'Code mode'}
            >
              {codeMode ? <Eye size={10} /> : <Code size={10} />}
            </button>
          )}
          {onRemove && (
            <button
              className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {codeMode && onCustomCodeChange ? (
          <CellCodeEditor
            cell={cell}
            customCode={customCode}
            onApply={(code) => { onCustomCodeChange(code); setCodeMode(false) }}
            onReset={() => { onCustomCodeChange(undefined); setCodeMode(false) }}
          />
        ) : isLoading && cell.dataBinding?.datasetId ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={16} className="animate-spin text-slate-300" /></div>
        ) : CustomComponent ? (
          <CustomComponent config={cell.config} data={cellData} width={0} height={0} />
        ) : Component ? (
          <Component config={cell.config} data={cellData} width={0} height={0} />
        ) : null}
      </div>
    </div>
  )
}

function CellCodeEditor({ cell, customCode, onApply, onReset }: {
  cell: CellSpec
  customCode?: string
  onApply: (code: string) => void
  onReset: () => void
}) {
  const initialCode = customCode ?? generateWidgetCode(cell.type, cell.config)
  const [text, setText] = useState(initialCode)
  const [error, setError] = useState<string | null>(null)

  function handleApply() {
    const err = validateCustomCode(text)
    if (err) { setError(err); return }
    setError(null)
    onApply(text)
  }

  return (
    <div className="h-full flex flex-col p-1.5 gap-1">
      <textarea
        className="flex-1 min-h-0 w-full font-mono text-[10px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded p-1.5 resize-none focus:ring-1 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <div className="flex items-center gap-1 shrink-0">
        {error && <span className="text-[9px] text-red-500 truncate flex-1">{error}</span>}
        <div className="flex-1" />
        {customCode && (
          <button
            className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-red-500 rounded hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onReset() }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <RotateCcw size={9} />
            Reset
          </button>
        )}
        <button
          className="px-2 py-0.5 text-[10px] font-medium bg-tech-blue text-white rounded hover:bg-tech-blue/90"
          onClick={(e) => { e.stopPropagation(); handleApply() }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
