import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDashboards, deleteDashboard } from '@/store/persistence'
import type { DashboardSpec } from '@/schemas/dashboard.schema'
import { Plus, Trash2, Eye, Pencil, LayoutDashboard } from 'lucide-react'

export function LandingPage() {
  const [dashboards, setDashboards] = useState<DashboardSpec[]>([])

  useEffect(() => {
    setDashboards(listDashboards())
  }, [])

  function handleDelete(id: string) {
    if (!confirm('Delete this dashboard?')) return
    deleteDashboard(id)
    setDashboards(listDashboards())
  }

  return (
    <div className="min-h-screen bg-paper-50 relative">
      {/* Aurora background */}
      <div className="aurora-container">
        <div className="aurora-element bg-blue-400" style={{ top: '20%', left: '20%' }} />
        <div className="aurora-element bg-purple-300" style={{ top: '50%', left: '60%', animationDelay: '2s' }} />
        <div className="aurora-element bg-emerald-200" style={{ top: '10%', left: '70%' }} />
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={28} className="text-tech-blue" />
            <h1 className="text-2xl font-bold text-ai-gradient">Dashboard Builder</h1>
          </div>
          <Link
            to="/builder"
            className="flex items-center gap-2 px-4 py-2 btn-gradient rounded-lg text-sm"
          >
            <Plus size={16} /> New Dashboard
          </Link>
        </div>

        {dashboards.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <LayoutDashboard size={48} className="mx-auto mb-4 opacity-50" />
            <p>No dashboards yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {dashboards.map(d => (
              <div key={d.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-slate-800">{d.name}</h2>
                  <p className="text-sm text-slate-400">{d.widgets.length} widget{d.widgets.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/viewer/${d.id}`} className="p-2 hover:bg-white/50 rounded-lg" title="View">
                    <Eye size={16} className="text-slate-500" />
                  </Link>
                  <Link to={`/builder/${d.id}`} className="p-2 hover:bg-white/50 rounded-lg" title="Edit">
                    <Pencil size={16} className="text-slate-500" />
                  </Link>
                  <button onClick={() => handleDelete(d.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
