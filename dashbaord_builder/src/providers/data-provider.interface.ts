export interface FieldDef {
  name: string
  type: 'string' | 'number' | 'date'
}

export interface DatasetInfo {
  id: string
  name: string
}

export interface DataQuery {
  datasetId: string
  fields?: string[]
  filters?: Array<{
    field: string
    op: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'gte' | 'lte'
    value: string | number
  }>
}

export interface DataResult {
  rows: Record<string, unknown>[]
  fields: FieldDef[]
}

export interface DataProvider {
  listDatasets(): Promise<DatasetInfo[]>
  getFields(datasetId: string): Promise<FieldDef[]>
  query(q: DataQuery): Promise<DataResult>
}
