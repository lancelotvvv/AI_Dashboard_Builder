import { useEffect, useState } from 'react'
import { useDataProvider } from '@/providers/provider-context'
import { useDashboardStore } from '@/store/dashboard.store'
import type { DatasetInfo, FieldDef } from '@/providers/data-provider.interface'

export function DataBindingUI({ widgetId }: { widgetId: string }) {
  const provider = useDataProvider()
  const widget = useDashboardStore(s => s.spec.widgets.find(w => w.id === widgetId))
  const updateDataBinding = useDashboardStore(s => s.updateWidgetDataBinding)
  const [datasets, setDatasets] = useState<DatasetInfo[]>([])
  const [fields, setFields] = useState<FieldDef[]>([])

  useEffect(() => {
    provider.listDatasets().then(setDatasets)
  }, [provider])

  const currentDatasetId = widget?.dataBinding?.datasetId ?? ''

  useEffect(() => {
    if (currentDatasetId) {
      provider.getFields(currentDatasetId).then(setFields)
    } else {
      setFields([])
    }
  }, [currentDatasetId, provider])

  function handleDatasetChange(datasetId: string) {
    if (datasetId) {
      updateDataBinding(widgetId, { datasetId, fieldMap: {}, filters: [] })
    } else {
      updateDataBinding(widgetId, undefined)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase">Data Binding</h3>
      <div>
        <label className="text-xs text-gray-500">Dataset</label>
        <select
          className="w-full border rounded px-2 py-1.5 text-sm mt-1"
          value={currentDatasetId}
          onChange={e => handleDatasetChange(e.target.value)}
        >
          <option value="">None</option>
          {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      {fields.length > 0 && (
        <div className="text-xs text-gray-500">
          Fields: {fields.map(f => f.name).join(', ')}
        </div>
      )}
    </div>
  )
}
