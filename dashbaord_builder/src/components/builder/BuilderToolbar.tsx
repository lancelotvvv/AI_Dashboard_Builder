import { useDashboardStore } from '@/store/dashboard.store'
import { saveDashboard, exportDashboard, importDashboard } from '@/store/persistence'
import { useTemporalStore } from '@/store/dashboard.store.temporal'
import { useDeveloperStore } from '@/store/developer.store'
import { Save, Download, Upload, Undo2, Redo2, Sparkles, Home, Settings, Code2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiPromptModal } from './AiPromptModal'

export function BuilderToolbar() {
  const spec = useDashboardStore(s => s.spec)
  const setSpec = useDashboardStore(s => s.setSpec)
  const setName = useDashboardStore(s => s.setName)
  const selectWidget = useDashboardStore(s => s.selectWidget)
  const { undo, redo } = useTemporalStore()
  const navigate = useNavigate()
  const devMode = useDeveloperStore(s => s.devMode)
  const toggleDevMode = useDeveloperStore(s => s.toggleDevMode)
  const fileRef = useRef<HTMLInputElement>(null)
  const [showAi, setShowAi] = useState(false)
  const [showDevWarning, setShowDevWarning] = useState(false)

  function handleSave() {
    saveDashboard(spec)
    alert('Dashboard saved!')
  }

  function handleExport() {
    const json = exportDashboard(spec)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${spec.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = importDashboard(reader.result as string)
        setSpec(imported)
      } catch (err) {
        alert('Invalid dashboard JSON: ' + (err as Error).message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <div className="glass-card border-b border-white/60 px-4 py-2 flex items-center gap-3 rounded-none">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/50 rounded-lg text-slate-500" title="Home"><Home size={18} /></button>
        <div className="w-px h-6 bg-slate-200/60" />
        <input
          type="text"
          className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-tech-blue focus:outline-none px-1"
          value={spec.name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={() => selectWidget(null)} className="p-2 hover:bg-white/50 rounded-lg text-slate-500" title="Page Settings"><Settings size={18} /></button>
        <button
          onClick={() => { if (!devMode) setShowDevWarning(true); else toggleDevMode() }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${devMode ? 'bg-tech-purple text-white' : 'bg-slate-200/60 text-slate-500 hover:bg-slate-200'}`}
          title={devMode ? 'Developer Mode (ON)' : 'Developer Mode (OFF)'}
        >
          <Code2 size={14} />
          <span>Dev</span>
          <div className={`w-7 h-4 rounded-full relative transition-colors ${devMode ? 'bg-white/30' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${devMode ? 'left-3.5 bg-white' : 'left-0.5 bg-white'}`} />
          </div>
        </button>
        <div className="flex-1" />
        <button onClick={() => undo()} className="p-2 hover:bg-white/50 rounded-lg text-slate-500" title="Undo"><Undo2 size={18} /></button>
        <button onClick={() => redo()} className="p-2 hover:bg-white/50 rounded-lg text-slate-500" title="Redo"><Redo2 size={18} /></button>
        <div className="w-px h-6 bg-slate-200/60" />
        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 btn-gradient rounded-lg text-sm">
          <Save size={14} /> Save
        </button>
        <button onClick={handleExport} className="p-2 hover:bg-white/50 rounded-lg text-slate-500" title="Export JSON"><Download size={18} /></button>
        <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-white/50 rounded-lg text-slate-500" title="Import JSON"><Upload size={18} /></button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <div className="w-px h-6 bg-slate-200/60" />
        <button onClick={() => setShowAi(true)} className="flex items-center gap-1.5 px-3 py-1.5 btn-gradient rounded-lg text-sm">
          <Sparkles size={14} /> AI
        </button>
      </div>
      {showAi && <AiPromptModal onClose={() => setShowAi(false)} />}
      {showDevWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowDevWarning(false)}>
          <div className="bg-white rounded-xl shadow-xl p-5 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Enable Developer Mode?</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Developer Mode lets you edit the full rendering code of each widget. Manually edited code will take priority over inspector-based configuration, and visual config changes may not apply until the custom code is reset.
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setShowDevWarning(false)}>Cancel</button>
              <button className="px-3 py-1.5 text-xs font-medium bg-tech-purple text-white rounded-lg hover:bg-tech-purple/90" onClick={() => { toggleDevMode(); setShowDevWarning(false) }}>Enable</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
