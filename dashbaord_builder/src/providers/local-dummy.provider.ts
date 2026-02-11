import type { DataProvider, DataQuery, DataResult, DatasetInfo, FieldDef } from './data-provider.interface'
import { dummyDatasets } from '@/data/dummy-datasets'

export class LocalDummyProvider implements DataProvider {
  async listDatasets(): Promise<DatasetInfo[]> {
    return dummyDatasets.map(d => ({ id: d.id, name: d.name }))
  }

  async getFields(datasetId: string): Promise<FieldDef[]> {
    const ds = dummyDatasets.find(d => d.id === datasetId)
    return ds?.fields ?? []
  }

  async query(q: DataQuery): Promise<DataResult> {
    const ds = dummyDatasets.find(d => d.id === q.datasetId)
    if (!ds) return { rows: [], fields: [] }

    let rows = [...ds.rows]

    if (q.filters) {
      for (const f of q.filters) {
        rows = rows.filter(row => {
          const v = row[f.field]
          switch (f.op) {
            case 'eq': return v === f.value
            case 'neq': return v !== f.value
            case 'gt': return typeof v === 'number' && v > Number(f.value)
            case 'lt': return typeof v === 'number' && v < Number(f.value)
            case 'contains': return String(v).toLowerCase().includes(String(f.value).toLowerCase())
            case 'gte': return typeof v === 'number' ? v >= Number(f.value) : String(v) >= String(f.value)
            case 'lte': return typeof v === 'number' ? v <= Number(f.value) : String(v) <= String(f.value)
          }
        })
      }
    }

    const fields = q.fields
      ? ds.fields.filter(f => q.fields!.includes(f.name))
      : ds.fields

    if (q.fields) {
      rows = rows.map(row => {
        const out: Record<string, unknown> = {}
        for (const f of q.fields!) out[f] = row[f]
        return out
      })
    }

    return { rows, fields }
  }
}
