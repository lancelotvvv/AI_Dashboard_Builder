import { type ReactNode, Component, type ErrorInfo, useState } from 'react'
import { useDashboardStore } from '@/store/dashboard.store'
import { useDeveloperStore } from '@/store/developer.store'
import { generateWidgetCode } from '@/lib/code-gen'
import { validateCustomCode } from '@/lib/code-runner'
import { X, Code, Eye, RotateCcw } from 'lucide-react'

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Widget error:', error, info) }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

interface WidgetFrameProps {
  id: string
  title: string
  isSelected: boolean
  editable: boolean
  children: ReactNode
}

export function WidgetFrame({ id, title, isSelected, editable, children }: WidgetFrameProps) {
  const selectWidget = useDashboardStore(s => s.selectWidget)
  const removeWidget = useDashboardStore(s => s.removeWidget)
  const widget = useDashboardStore(s => s.spec.widgets.find(w => w.id === id))
  const updateWidgetCustomCode = useDashboardStore(s => s.updateWidgetCustomCode)
  const devMode = useDeveloperStore(s => s.devMode)
  const [codeMode, setCodeMode] = useState(false)

  return (
    <div
      className={`glass-card rounded-xl h-full flex flex-col overflow-hidden ${
        isSelected ? 'ring-2 ring-tech-purple border-tech-blue/30' : ''
      }`}
      onClick={(e) => { if (editable) { e.stopPropagation(); selectWidget(id) } }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/60 text-xs font-medium text-slate-500 shrink-0">
        <span className="truncate flex-1">{title}</span>
        {widget?.customCode && !codeMode && (
          <span className="text-[9px] text-tech-purple bg-tech-purple/10 rounded px-1 py-0.5 mr-1">custom</span>
        )}
        {editable && (
          <div className="flex items-center gap-0.5 ml-2">
            {devMode && (
              <button
                className={`p-0.5 rounded transition-colors ${codeMode ? 'bg-tech-blue/10 text-tech-blue' : 'hover:bg-white/50 text-slate-400'}`}
                onClick={(e) => { e.stopPropagation(); setCodeMode(!codeMode) }}
                onMouseDown={(e) => e.stopPropagation()}
                title={codeMode ? 'Visual mode' : 'Code mode'}
              >
                {codeMode ? <Eye size={13} /> : <Code size={13} />}
              </button>
            )}
            <button
              className="p-0.5 hover:bg-white/50 rounded text-slate-400"
              onClick={(e) => { e.stopPropagation(); removeWidget(id) }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <ErrorBoundary fallback={<div className="p-4 text-red-500 text-sm">Widget error</div>}>
          {editable && codeMode && widget ? (
            <FullCodeEditor
              widget={widget}
              onApply={(code) => { updateWidgetCustomCode(id, code); setCodeMode(false) }}
              onReset={() => { updateWidgetCustomCode(id, undefined); setCodeMode(false) }}
            />
          ) : (
            children
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

function FullCodeEditor({ widget, onApply, onReset }: {
  widget: { type: string; config: Record<string, unknown>; customCode?: string }
  onApply: (code: string) => void
  onReset: () => void
}) {
  const initialCode = widget.customCode ?? generateWidgetCode(widget.type, widget.config)
  const [text, setText] = useState(initialCode)
  const [error, setError] = useState<string | null>(null)

  function handleApply() {
    const err = validateCustomCode(text)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    onApply(text)
  }

  return (
    <div className="h-full flex flex-col p-2 gap-1.5">
      <textarea
        className="flex-1 min-h-0 w-full font-mono text-[11px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 resize-none focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <div className="flex items-center gap-2 shrink-0">
        {error && <span className="text-[10px] text-red-500 truncate flex-1">{error}</span>}
        <div className="flex-1" />
        {widget.customCode && (
          <button
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); onReset() }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Reset to default generated code"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
        <button
          className="px-2.5 py-1 text-[11px] font-medium bg-tech-blue text-white rounded-md hover:bg-tech-blue/90 transition-colors"
          onClick={(e) => { e.stopPropagation(); handleApply() }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          Apply
        </button>
      </div>
    </div>
  )
}
