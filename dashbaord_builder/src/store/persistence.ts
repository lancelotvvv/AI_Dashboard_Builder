import type { DashboardSpec } from '@/schemas/dashboard.schema'
import { dashboardSpecSchema } from '@/schemas/dashboard.schema'

const STORAGE_KEY = 'dashboard-builder-specs'

function getAll(): Record<string, DashboardSpec> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function listDashboards(): DashboardSpec[] {
  return Object.values(getAll())
}

export function loadDashboard(id: string): DashboardSpec | null {
  const all = getAll()
  const raw = all[id]
  if (!raw) return null
  return dashboardSpecSchema.parse(raw)
}

export function saveDashboard(spec: DashboardSpec): void {
  const all = getAll()
  all[spec.id] = spec
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteDashboard(id: string): void {
  const all = getAll()
  delete all[id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function exportDashboard(spec: DashboardSpec): string {
  return JSON.stringify(spec, null, 2)
}

export function importDashboard(json: string): DashboardSpec {
  const parsed = JSON.parse(json)
  return dashboardSpecSchema.parse(parsed)
}
