import { useState, useRef, useEffect } from 'react'
import { useDashboardStore } from '@/store/dashboard.store'
import { MockAiService } from '@/ai/mock-ai.service'
import type { ToolCall, ToolResult } from '@/ai/ai-service.interface'
import { X, Sparkles, Loader2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

const ai = new MockAiService()

interface ToolLogEntry {
  call: ToolCall
  result?: ToolResult
  status: 'pending' | 'running' | 'done' | 'error'
}

export function AiPromptModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [toolLog, setToolLog] = useState<ToolLogEntry[]>([])
  const spec = useDashboardStore(s => s.spec)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [toolLog])

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setToolLog([])

    try {
      const calls = await ai.chat(prompt, spec)

      // Show all calls as pending
      setToolLog(calls.map(c => ({ call: c, status: 'pending' })))

      // Execute sequentially with visual feedback
      for (let i = 0; i < calls.length; i++) {
        setToolLog(prev => prev.map((entry, j) =>
          j === i ? { ...entry, status: 'running' } : entry
        ))

        const result = await ai.executeToolCall(calls[i])

        setToolLog(prev => prev.map((entry, j) =>
          j === i ? { ...entry, result, status: result.success ? 'done' : 'error' } : entry
        ))
      }
    } catch (err) {
      setToolLog(prev => [...prev, {
        call: { name: 'error', params: {} },
        result: { success: false, error: (err as Error).message },
        status: 'error',
      }])
    } finally {
      setLoading(false)
    }
  }

  const isComplete = toolLog.length > 0 && toolLog.every(e => e.status === 'done' || e.status === 'error')

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass-card rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-tech-purple" />
            <span className="text-ai-gradient">AI Dashboard Builder</span>
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-lg"><X size={18} /></button>
        </div>

        {toolLog.length === 0 && (
          <>
            <p className="text-sm text-slate-500 mb-3">Describe the dashboard you want to create. The AI will generate widgets and layout using tool calls.</p>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-tech-blue/30 focus:border-tech-blue outline-none"
              rows={4}
              placeholder="e.g., Create a sales dashboard with monthly revenue chart and KPI cards..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              autoFocus
            />
          </>
        )}

        {toolLog.length > 0 && (
          <div ref={logRef} className="max-h-80 overflow-y-auto space-y-2 mb-4">
            {toolLog.map((entry, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                entry.status === 'running' ? 'bg-blue-50 border border-blue-100' :
                entry.status === 'done' ? 'bg-green-50/50 border border-green-100' :
                entry.status === 'error' ? 'bg-red-50/50 border border-red-100' :
                'bg-slate-50 border border-slate-100'
              }`}>
                <div className="mt-0.5 shrink-0">
                  {entry.status === 'running' && <Loader2 size={14} className="animate-spin text-tech-blue" />}
                  {entry.status === 'done' && <CheckCircle2 size={14} className="text-green-500" />}
                  {entry.status === 'error' && <XCircle size={14} className="text-red-500" />}
                  {entry.status === 'pending' && <ChevronRight size={14} className="text-slate-300" />}
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-xs font-medium text-slate-700">{entry.call.name}</span>
                  {entry.call.params && Object.keys(entry.call.params).length > 0 && (
                    <span className="text-xs text-slate-400 ml-1">
                      ({Object.entries(entry.call.params)
                        .filter(([k]) => k !== 'config')
                        .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join(', ')})
                    </span>
                  )}
                  {entry.result?.error && (
                    <p className="text-xs text-red-500 mt-0.5">{entry.result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-white/50">
            {isComplete ? 'Done' : 'Cancel'}
          </button>
          {!isComplete && (
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm btn-gradient rounded-lg disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
