import type { FieldDef } from '@/providers/data-provider.interface'

export interface DummyDataset {
  id: string
  name: string
  fields: FieldDef[]
  rows: Record<string, unknown>[]
}

export const dummyDatasets: DummyDataset[] = [
  {
    id: 'sales',
    name: 'Monthly Sales',
    fields: [
      { name: 'month', type: 'string' },
      { name: 'revenue', type: 'number' },
      { name: 'units', type: 'number' },
      { name: 'region', type: 'string' },
    ],
    rows: [
      { month: 'Jan', revenue: 42000, units: 120, region: 'North' },
      { month: 'Feb', revenue: 38000, units: 105, region: 'North' },
      { month: 'Mar', revenue: 55000, units: 160, region: 'South' },
      { month: 'Apr', revenue: 47000, units: 135, region: 'South' },
      { month: 'May', revenue: 61000, units: 180, region: 'East' },
      { month: 'Jun', revenue: 53000, units: 150, region: 'East' },
      { month: 'Jul', revenue: 59000, units: 170, region: 'West' },
      { month: 'Aug', revenue: 64000, units: 190, region: 'West' },
      { month: 'Sep', revenue: 48000, units: 140, region: 'North' },
      { month: 'Oct', revenue: 52000, units: 155, region: 'South' },
      { month: 'Nov', revenue: 68000, units: 200, region: 'East' },
      { month: 'Dec', revenue: 72000, units: 215, region: 'West' },
    ],
  },
  {
    id: 'tokens',
    name: 'Token Usage',
    fields: [
      { name: 'model', type: 'string' },
      { name: 'tokens_in', type: 'number' },
      { name: 'tokens_out', type: 'number' },
      { name: 'cost', type: 'number' },
      { name: 'date', type: 'date' },
    ],
    rows: [
      { model: 'GPT-4', tokens_in: 150000, tokens_out: 45000, cost: 12.5, date: '2024-01-15' },
      { model: 'Claude', tokens_in: 200000, tokens_out: 60000, cost: 9.8, date: '2024-01-15' },
      { model: 'GPT-4', tokens_in: 180000, tokens_out: 52000, cost: 14.2, date: '2024-02-15' },
      { model: 'Claude', tokens_in: 250000, tokens_out: 78000, cost: 11.5, date: '2024-02-15' },
      { model: 'Gemini', tokens_in: 120000, tokens_out: 35000, cost: 7.2, date: '2024-02-15' },
      { model: 'GPT-4', tokens_in: 220000, tokens_out: 68000, cost: 18.1, date: '2024-03-15' },
      { model: 'Claude', tokens_in: 310000, tokens_out: 95000, cost: 14.8, date: '2024-03-15' },
      { model: 'Gemini', tokens_in: 160000, tokens_out: 48000, cost: 9.1, date: '2024-03-15' },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio Holdings',
    fields: [
      { name: 'asset', type: 'string' },
      { name: 'sector', type: 'string' },
      { name: 'value', type: 'number' },
      { name: 'weight', type: 'number' },
      { name: 'return_ytd', type: 'number' },
    ],
    rows: [
      { asset: 'AAPL', sector: 'Tech', value: 250000, weight: 15.2, return_ytd: 12.5 },
      { asset: 'MSFT', sector: 'Tech', value: 220000, weight: 13.4, return_ytd: 18.3 },
      { asset: 'JPM', sector: 'Finance', value: 180000, weight: 10.9, return_ytd: 8.7 },
      { asset: 'JNJ', sector: 'Healthcare', value: 150000, weight: 9.1, return_ytd: -2.1 },
      { asset: 'XOM', sector: 'Energy', value: 130000, weight: 7.9, return_ytd: 5.4 },
      { asset: 'PG', sector: 'Consumer', value: 120000, weight: 7.3, return_ytd: 3.2 },
      { asset: 'NVDA', sector: 'Tech', value: 300000, weight: 18.2, return_ytd: 45.6 },
      { asset: 'BRK.B', sector: 'Finance', value: 160000, weight: 9.7, return_ytd: 10.1 },
      { asset: 'UNH', sector: 'Healthcare', value: 135000, weight: 8.2, return_ytd: 6.8 },
    ],
  },
]
