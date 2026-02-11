import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboard.store'
import {
  TrendingUp, BarChart3, Table, Type, LayoutGrid, Filter,
  ChevronDown, ChevronRight,
  BarChart, LineChart, PieChart, AreaChart, ScatterChart,
} from 'lucide-react'
import type { WidgetSpec } from '@/schemas/dashboard.schema'
import type { LucideIcon } from 'lucide-react'

const chartSubtypes: { chartType: string; label: string; icon: LucideIcon }[] = [
  { chartType: 'bar', label: 'Bar', icon: BarChart },
  { chartType: 'line', label: 'Line', icon: LineChart },
  { chartType: 'area', label: 'Area', icon: AreaChart },
  { chartType: 'pie', label: 'Pie', icon: PieChart },
  { chartType: 'donut', label: 'Donut', icon: PieChart },
  { chartType: 'stacked-bar', label: 'Stacked Bar', icon: BarChart3 },
  { chartType: 'scatter', label: 'Scatter', icon: ScatterChart },
]

export function WidgetPalette() {
  const addWidget = useDashboardStore(s => s.addWidget)
  const [chartsOpen, setChartsOpen] = useState(false)

  return (
    <div className="w-56 glass-card border-r border-white/60 p-4 flex flex-col gap-2 shrink-0 rounded-none overflow-y-auto">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Widgets</h2>

      {/* Filter */}
      <PaletteItem
        icon={Filter}
        label="Filter"
        onClick={() => addWidget('filter' as WidgetSpec['type'])}
        onDragStart={(e) => e.dataTransfer.setData('widgetType', 'filter')}
      />

      {/* Container */}
      <PaletteItem
        icon={LayoutGrid}
        label="Container"
        onClick={() => addWidget('container' as WidgetSpec['type'])}
        onDragStart={(e) => e.dataTransfer.setData('widgetType', 'container')}
      />

      {/* KPI */}
      <PaletteItem
        icon={TrendingUp}
        label="KPI"
        onClick={() => addWidget('kpi')}
        onDragStart={(e) => e.dataTransfer.setData('widgetType', 'kpi')}
      />

      {/* Charts — collapsible */}
      <div>
        <button
          className="flex items-center gap-3 p-3 rounded-xl glass-card w-full text-left hover:-translate-y-0.5 active:translate-y-0 transition-transform"
          onClick={() => setChartsOpen(!chartsOpen)}
        >
          <BarChart3 size={18} className="text-tech-blue" />
          <span className="text-sm font-medium text-slate-700 flex-1">Charts</span>
          {chartsOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
        </button>
        {chartsOpen && (
          <div className="ml-3 mt-1 flex flex-col gap-1">
            {chartSubtypes.map(sub => (
              <div
                key={sub.chartType}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/60 transition-colors text-sm text-slate-600"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('widgetType', 'chart')}
                onClick={() => addWidget('chart', { chartType: sub.chartType })}
              >
                <sub.icon size={15} className="text-tech-purple" />
                <span>{sub.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <PaletteItem
        icon={Table}
        label="Table"
        onClick={() => addWidget('table')}
        onDragStart={(e) => e.dataTransfer.setData('widgetType', 'table')}
      />

      {/* Text */}
      <PaletteItem
        icon={Type}
        label="Text"
        onClick={() => addWidget('text')}
        onDragStart={(e) => e.dataTransfer.setData('widgetType', 'text')}
      />
    </div>
  )
}

function PaletteItem({ icon: Icon, label, onClick, onDragStart }: {
  icon: LucideIcon
  label: string
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl glass-card cursor-grab hover:-translate-y-0.5 active:translate-y-0 transition-transform"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <Icon size={18} className="text-tech-blue" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  )
}
