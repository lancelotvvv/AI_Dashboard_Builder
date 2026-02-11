import { useParams, Link } from 'react-router-dom'
import { loadDashboard } from '@/store/persistence'
import { ViewerGrid } from './ViewerGrid'
import { ViewerProvider } from './ViewerContext'
import { ArrowLeft } from 'lucide-react'

export function ViewerShell() {
  const { id } = useParams<{ id: string }>()
  const spec = id ? loadDashboard(id) : null

  if (!spec) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-gray-500">Dashboard not found</p>
        <Link to="/" className="text-blue-500 hover:underline">Go home</Link>
      </div>
    )
  }

  return (
    <ViewerProvider value={true}>
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1 hover:bg-gray-100 rounded"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg font-semibold">{spec.name}</h1>
          <Link to={`/builder/${spec.id}`} className="ml-auto text-sm text-blue-500 hover:underline">Edit</Link>
        </div>
        <div className="p-4">
          <ViewerGrid spec={spec} />
        </div>
      </div>
    </ViewerProvider>
  )
}
