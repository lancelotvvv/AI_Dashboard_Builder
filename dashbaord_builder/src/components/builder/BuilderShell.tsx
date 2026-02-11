import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDashboardStore } from '@/store/dashboard.store'
import { loadDashboard } from '@/store/persistence'
import { BuilderToolbar } from './BuilderToolbar'
import { WidgetPalette } from './WidgetPalette'
import { GridCanvas } from './GridCanvas'
import { InspectorPanel } from './InspectorPanel'

export function BuilderShell() {
  const { id } = useParams<{ id: string }>()
  const setSpec = useDashboardStore(s => s.setSpec)
  const newDashboard = useDashboardStore(s => s.newDashboard)

  useEffect(() => {
    if (id) {
      const loaded = loadDashboard(id)
      if (loaded) setSpec(loaded)
    } else {
      newDashboard()
    }
  }, [id, setSpec, newDashboard])

  return (
    <div className="h-screen flex flex-col bg-paper-50 relative">
      {/* Aurora background */}
      <div className="aurora-container">
        <div className="aurora-element bg-blue-400" style={{ top: '20%', left: '20%' }} />
        <div className="aurora-element bg-purple-300" style={{ top: '50%', left: '60%', animationDelay: '2s' }} />
        <div className="aurora-element bg-emerald-200" style={{ top: '10%', left: '70%' }} />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <BuilderToolbar />
        <div className="flex flex-1 min-h-0">
          <WidgetPalette />
          <GridCanvas />
          <InspectorPanel />
        </div>
      </div>
    </div>
  )
}
