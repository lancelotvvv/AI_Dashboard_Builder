import { useQuery } from '@tanstack/react-query'
import { useDataProvider } from '@/providers/provider-context'
import type { DataBinding } from '@/schemas/dashboard.schema'
import type { DataResult } from '@/providers/data-provider.interface'
import { useFilterStore } from '@/store/filter.store'

export function useWidgetData(dataBinding?: DataBinding) {
  const provider = useDataProvider()
  const activeFilters = useFilterStore((s) => s.activeFilters)

  // Collect global filters that match this widget's datasetId
  const globalFilters: Array<{ field: string; op: string; value: string | number }> = []
  if (dataBinding?.datasetId) {
    activeFilters.forEach((f) => {
      if (f.datasetId === dataBinding.datasetId) {
        globalFilters.push({ field: f.field, op: f.op, value: f.value })
      }
    })
  }

  // Stable serialization for queryKey
  const globalFilterKey = globalFilters.map((f) => `${f.field}:${f.op}:${f.value}`).sort().join('|')

  return useQuery<DataResult>({
    queryKey: ['widget-data', dataBinding, globalFilterKey],
    queryFn: () => {
      if (!dataBinding) return Promise.resolve({ rows: [], fields: [] })
      const mergedFilters = [
        ...(dataBinding.filters ?? []),
        ...globalFilters.map((f) => ({ field: f.field, op: f.op as any, value: f.value })),
      ]
      return provider.query({
        datasetId: dataBinding.datasetId,
        filters: mergedFilters,
      })
    },
    enabled: !!dataBinding?.datasetId,
    staleTime: 30_000,
  })
}
