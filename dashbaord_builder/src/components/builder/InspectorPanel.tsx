import { useEffect, useState } from 'react'
import { useDashboardStore, useUISelectionStore } from '@/store/dashboard.store'
import { getWidgetEntry } from '@/registry/widget-registry'
import { DataBindingUI } from './DataBindingUI'
import { useDataProvider } from '@/providers/provider-context'
import { ArrowLeft, Settings } from 'lucide-react'
import type { z } from 'zod'
import type { ContainerConfig, CellSpec } from '@/schemas/widget-configs.schema'
import type { DatasetInfo, FieldDef } from '@/providers/data-provider.interface'

function isFieldKey(key: string) {
  return key === 'field' || key.endsWith('Field')
}

/** Human-readable labels for config keys */
const FIELD_LABELS: Record<string, string> = {
  chartType: 'Chart Type',
  xField: 'X Axis Field',
  yField: 'Y Axis Field',
  xAxisLabel: 'X Axis Title',
  yAxisLabel: 'Y Axis Title',
  showLegend: 'Show Legend',
  showDataLabels: 'Show Data Labels',
  showGrid: 'Show Gridlines',
  showTooltip: 'Show Tooltip on Hover',
  sortOrder: 'Sort Data By Value',
  color: 'Color',
  label: 'Label',
  prefix: 'Value Prefix',
  suffix: 'Value Suffix',
  trendField: 'Trend Comparison Field',
  valueField: 'Value Field',
  fontSize: 'Font Size',
  showTrend: 'Show Trend Indicator',
  columns: 'Visible Columns',
  pageSize: 'Rows Per Page',
  striped: 'Alternating Row Colors',
  showRowNumbers: 'Show Row Numbers',
  compact: 'Compact Rows',
  content: 'Content',
  displayType: 'Display Style',
  datasetId: 'Dataset',
  field: 'Filter Field',
  options: 'Filter Options',
  cols: 'Grid Columns',
  rows: 'Grid Rows',
}

/** Human-readable labels for enum option values */
const ENUM_LABELS: Record<string, Record<string, string>> = {
  chartType: { bar: 'Bar', line: 'Line', pie: 'Pie', area: 'Area', 'stacked-bar': 'Stacked Bar', donut: 'Donut', scatter: 'Scatter' },
  sortOrder: { none: 'Original Order', asc: 'Low → High', desc: 'High → Low' },
  fontSize: { sm: 'Small', base: 'Medium', lg: 'Large', xl: 'Extra Large', '2xl': 'Huge' },
  displayType: { dropdown: 'Dropdown', 'button-group': 'Button Group', 'date-range': 'Date Range' },
}

function friendlyLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

function useDatasets() {
  const provider = useDataProvider()
  const [datasets, setDatasets] = useState<DatasetInfo[]>([])
  useEffect(() => {
    provider.listDatasets().then(setDatasets)
  }, [provider])
  return datasets
}

function useDatasetFields(datasetId: string | undefined) {
  const provider = useDataProvider()
  const [fields, setFields] = useState<FieldDef[]>([])
  useEffect(() => {
    if (datasetId) {
      provider.getFields(datasetId).then(setFields)
    } else {
      setFields([])
    }
  }, [datasetId, provider])
  return fields
}

function SchemaForm({ schema, values, onChange, fields = [], datasets = [] }: {
  schema: z.ZodType
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  fields?: FieldDef[]
  datasets?: DatasetInfo[]
}) {
  let inner: z.ZodType = schema
  while ((inner as any)._def?.innerType) inner = (inner as any)._def.innerType
  const shapeFn = (inner as any)._def?.shape
  const shape = (typeof shapeFn === 'function' ? shapeFn() : shapeFn) ?? {}

  const inputCls = "w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"

  return (
    <div className="space-y-3">
      {Object.entries(shape).map(([key, fieldSchema]) => {
        let coreDef = (fieldSchema as z.ZodType)._def
        while (coreDef.innerType) coreDef = coreDef.innerType._def
        const value = values[key] ?? ''
        const label = friendlyLabel(key)

        // Skip internal keys
        if (key.startsWith('_')) return null

        if (coreDef.typeName === 'ZodArray') {
          if (key === 'columns' && fields.length > 0) {
            const selected = Array.isArray(value) ? (value as string[]) : []
            return (
              <div key={key}>
                <label className="text-xs text-slate-500 font-medium">{label}</label>
                <div className="mt-1 border border-slate-200 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                  {fields.map(f => (
                    <label key={f.name} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded px-1">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-tech-blue focus:ring-tech-blue/30"
                        checked={selected.includes(f.name)}
                        onChange={e => {
                          const next = e.target.checked
                            ? [...selected, f.name]
                            : selected.filter(s => s !== f.name)
                          onChange(key, next)
                        }}
                      />
                      {f.name}
                    </label>
                  ))}
                </div>
              </div>
            )
          }
          const arrValue = Array.isArray(value) ? (value as (string | number)[]).join('\n') : ''
          return (
            <div key={key}>
              <label className="text-xs text-slate-500 font-medium">{label}</label>
              <textarea
                className={inputCls}
                rows={4}
                value={arrValue}
                placeholder="One value per line"
                onChange={e => {
                  const lines = e.target.value.split('\n').filter(l => l.trim() !== '')
                  onChange(key, lines)
                }}
              />
            </div>
          )
        }

        if (coreDef.typeName === 'ZodBoolean') {
          return (
            <div key={key} className="flex items-center justify-between py-1">
              <label className="text-xs text-slate-500 font-medium">{label}</label>
              <button
                type="button"
                className={`w-9 h-5 rounded-full relative transition-colors ${value ? 'bg-tech-blue' : 'bg-slate-300'}`}
                onClick={() => onChange(key, !value)}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
          )
        }

        if (coreDef.typeName === 'ZodEnum') {
          const options = coreDef.values as string[]
          const enumMap = ENUM_LABELS[key]
          return (
            <div key={key}>
              <label className="text-xs text-slate-500 font-medium">{label}</label>
              <select className={inputCls} value={String(value)} onChange={e => onChange(key, e.target.value)}>
                {options.map((o: string) => <option key={o} value={o}>{enumMap?.[o] ?? o}</option>)}
              </select>
            </div>
          )
        }

        if (coreDef.typeName === 'ZodNumber') {
          return (
            <div key={key}>
              <label className="text-xs text-slate-500 font-medium">{label}</label>
              <input type="number" className={inputCls} value={Number(value)} onChange={e => onChange(key, Number(e.target.value))} />
            </div>
          )
        }

        // Color fields → native color picker
        if (key === 'color') {
          return (
            <div key={key}>
              <label className="text-xs text-slate-500 font-medium">{label}</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0"
                  value={String(value) || '#3b82f6'}
                  onChange={e => onChange(key, e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
                  value={String(value)}
                  onChange={e => onChange(key, e.target.value)}
                />
              </div>
            </div>
          )
        }

        // DatasetId → dataset dropdown
        if (key === 'datasetId' && datasets.length > 0) {
          return (
            <div key={key}>
              <label className="text-xs text-slate-500 font-medium">{label}</label>
              <select
                className={inputCls}
                value={String(value)}
                onChange={e => onChange(key, e.target.value)}
              >
                <option value="">— select —</option>
                {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )
        }

        // Field-name keys → render as dropdown when fields are available
        if (isFieldKey(key) && fields.length > 0) {
          return (
            <div key={key}>
              <label className="text-xs text-slate-500 font-medium">{label}</label>
              <select
                className={inputCls}
                value={String(value)}
                onChange={e => onChange(key, e.target.value)}
              >
                <option value="">— auto —</option>
                {fields.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
              </select>
            </div>
          )
        }

        return (
          <div key={key}>
            <label className="text-xs text-slate-500 font-medium">{label}</label>
            {key === 'content' ? (
              <textarea className={inputCls} rows={4} value={String(value)} onChange={e => onChange(key, e.target.value)} />
            ) : (
              <input type="text" className={inputCls} value={String(value)} onChange={e => onChange(key, e.target.value)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function InspectorPanel() {
  const selectedId = useDashboardStore(s => s.selectedWidgetId)
  const widget = useDashboardStore(s => s.spec.widgets.find(w => w.id === s.selectedWidgetId))
  const selectedCellIndex = useUISelectionStore(s => s.selectedCellIndex)

  if (!selectedId || !widget) {
    return <PageSettingsPanel />
  }

  if (widget.type === 'container' && selectedCellIndex != null) {
    const containerConfig = widget.config as ContainerConfig
    const cell = containerConfig.cells?.[selectedCellIndex] as CellSpec | null | undefined
    if (cell) {
      return <CellInspector widgetId={selectedId} cell={cell} cellIndex={selectedCellIndex} containerConfig={containerConfig} />
    }
  }

  return <WidgetInspector widgetId={selectedId} widget={widget} />
}

function CellInspector({ widgetId, cell, cellIndex, containerConfig }: {
  widgetId: string
  cell: CellSpec
  cellIndex: number
  containerConfig: ContainerConfig
}) {
  const updateConfig = useDashboardStore(s => s.updateWidgetConfig)
  const selectCell = useUISelectionStore(s => s.selectCell)
  const cellEntry = getWidgetEntry(cell.type)
  const datasets = useDatasets()
  const cellDatasetId = cell.dataBinding?.datasetId
  const fields = useDatasetFields(cellDatasetId)

  function updateCellConfig(key: string, value: unknown) {
    const cells = [...(containerConfig.cells ?? [])]
    const current = cells[cellIndex] as CellSpec
    cells[cellIndex] = { ...current, config: { ...current.config, [key]: value } }
    updateConfig(widgetId, { cells })
  }

  function updateCellTitle(title: string) {
    const cells = [...(containerConfig.cells ?? [])]
    const current = cells[cellIndex] as CellSpec
    cells[cellIndex] = { ...current, title }
    updateConfig(widgetId, { cells })
  }

  return (
    <div className="w-72 glass-card border-l border-white/60 p-4 shrink-0 overflow-y-auto space-y-6 rounded-none">
      <div>
        <button
          onClick={() => selectCell(null)}
          className="flex items-center gap-1.5 text-xs text-tech-blue hover:text-tech-purple mb-3"
        >
          <ArrowLeft size={12} /> Back to Container
        </button>
        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Cell {cellIndex + 1} — {cell.type}</h3>
        <div>
          <label className="text-xs text-slate-400">Title</label>
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
            value={cell.title}
            onChange={e => updateCellTitle(e.target.value)}
          />
        </div>
      </div>

      {cellEntry && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Config</h3>
          <SchemaForm
            schema={cellEntry.configSchema}
            values={cell.config as Record<string, unknown>}
            onChange={updateCellConfig}
            fields={fields}
            datasets={datasets}
          />
        </div>
      )}

      <CellDataBindingUI
        datasetId={cell.dataBinding?.datasetId ?? ''}
        onChange={(datasetId) => {
          const cells = [...(containerConfig.cells ?? [])]
          const current = cells[cellIndex] as CellSpec
          cells[cellIndex] = {
            ...current,
            dataBinding: datasetId ? { datasetId, fieldMap: {}, filters: [] } : undefined,
          }
          updateConfig(widgetId, { cells })
        }}
      />
    </div>
  )
}

function WidgetInspector({ widgetId, widget }: {
  widgetId: string
  widget: { type: string; title: string; config: Record<string, unknown>; dataBinding?: { datasetId: string } }
}) {
  const updateConfig = useDashboardStore(s => s.updateWidgetConfig)
  const updateTitle = useDashboardStore(s => s.updateWidgetTitle)
  const entry = getWidgetEntry(widget.type)
  const datasets = useDatasets()
  // For filter widgets, the datasetId is in config; for others, in dataBinding
  const datasetId = widget.dataBinding?.datasetId || (widget.config as any)?.datasetId || ''
  const fields = useDatasetFields(datasetId)

  return (
    <div className="w-72 glass-card border-l border-white/60 p-4 shrink-0 overflow-y-auto space-y-6 rounded-none">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Widget</h3>
        <div>
          <label className="text-xs text-slate-400">Title</label>
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
            value={widget.title}
            onChange={e => updateTitle(widgetId, e.target.value)}
          />
        </div>
      </div>

      {entry && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Config</h3>
          <SchemaForm
            schema={entry.configSchema}
            values={widget.config as Record<string, unknown>}
            onChange={(key, value) => updateConfig(widgetId, { [key]: value })}
            fields={fields}
            datasets={datasets}
          />
        </div>
      )}

      {widget.type !== 'filter' && <DataBindingUI widgetId={widgetId} />}
    </div>
  )
}

function CellDataBindingUI({ datasetId, onChange }: { datasetId: string; onChange: (datasetId: string) => void }) {
  const provider = useDataProvider()
  const [datasets, setDatasets] = useState<DatasetInfo[]>([])

  useEffect(() => {
    provider.listDatasets().then(setDatasets)
  }, [provider])

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Data Binding</h3>
      <div>
        <label className="text-xs text-slate-400">Dataset</label>
        <select
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
          value={datasetId}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">None (inherit from container)</option>
          {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
    </div>
  )
}

const layoutModeOptions = [
  { value: 'scrollable', label: 'Scrollable', desc: 'Vertically scrollable, fixed width' },
  { value: 'portrait-fixed', label: 'Portrait Fixed', desc: 'Fixed page, portrait orientation' },
  { value: 'landscape-fixed', label: 'Landscape Fixed', desc: 'Fixed page, landscape orientation' },
] as const

const widthPresets = [960, 1200, 1440, 1920] as const

function PageSettingsPanel() {
  const pageSettings = useDashboardStore(s => s.spec.pageSettings)
  const updatePageSettings = useDashboardStore(s => s.updatePageSettings)
  const layoutMode = pageSettings?.layoutMode ?? 'scrollable'
  const pageWidth = pageSettings?.pageWidth ?? 1200

  return (
    <div className="w-72 glass-card border-l border-white/60 p-4 shrink-0 overflow-y-auto space-y-6 rounded-none">
      <div className="flex items-center gap-2">
        <Settings size={16} className="text-tech-blue" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase">Page Settings</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-2 block">Layout Mode</label>
          <div className="space-y-1.5">
            {layoutModeOptions.map(o => (
              <button
                key={o.value}
                className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                  layoutMode === o.value
                    ? 'bg-tech-blue text-white'
                    : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200'
                }`}
                onClick={() => updatePageSettings({ layoutMode: o.value as any })}
              >
                <span className="text-xs font-medium block">{o.label}</span>
                <span className={`text-[10px] ${layoutMode === o.value ? 'text-white/70' : 'text-slate-400'}`}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-2 block">Page Width</label>
          <div className="grid grid-cols-2 gap-1.5">
            {widthPresets.map(w => (
              <button
                key={w}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  pageWidth === w
                    ? 'bg-tech-blue text-white'
                    : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200'
                }`}
                onClick={() => updatePageSettings({ pageWidth: w })}
              >
                {w}px
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white/60 focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
              value={pageWidth}
              min={320}
              max={3840}
              step={10}
              onChange={e => updatePageSettings({ pageWidth: Number(e.target.value) })}
            />
            <span className="text-[10px] text-slate-400">px</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400">Row Height</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              className="flex-1 accent-tech-blue"
              value={pageSettings?.rowHeight ?? 80}
              min={40}
              max={200}
              step={10}
              onChange={e => updatePageSettings({ rowHeight: Number(e.target.value) })}
            />
            <span className="text-xs text-slate-500 w-10 text-right">{pageSettings?.rowHeight ?? 80}px</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/60 pt-4">
        <p className="text-[11px] text-slate-400">Click a widget to configure it.</p>
      </div>
    </div>
  )
}
