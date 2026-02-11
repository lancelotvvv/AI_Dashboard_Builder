import type { AiService, ToolCall, ToolResult } from './ai-service.interface'
import type { DashboardSpec } from '@/schemas/dashboard.schema'
import { aiTools, type AiTool } from './tools'
import { executeToolCall } from './tool-executor'
import { genId } from '@/lib/utils'

export class MockAiService implements AiService {
  async generateDashboard(prompt: string, currentSpec?: DashboardSpec): Promise<Partial<DashboardSpec>> {
    await new Promise(r => setTimeout(r, 1500))

    const id1 = genId(), id2 = genId(), id3 = genId()

    return {
      name: `AI: ${prompt.slice(0, 30)}`,
      widgets: [
        { id: id1, type: 'kpi', title: 'Total Revenue', config: { label: 'Revenue', prefix: '$', suffix: '', color: '#3b82f6' }, dataBinding: { datasetId: 'sales', fieldMap: {}, filters: [] } },
        { id: id2, type: 'chart', title: 'Monthly Trend', config: { chartType: 'bar', xField: 'month', yField: 'revenue', color: '#22c55e' }, dataBinding: { datasetId: 'sales', fieldMap: {}, filters: [] } },
        { id: id3, type: 'table', title: 'Details', config: { columns: [], pageSize: 10 }, dataBinding: { datasetId: 'sales', fieldMap: {}, filters: [] } },
      ],
      layout: [
        { i: id1, x: 0, y: 0, w: 3, h: 2 },
        { i: id2, x: 3, y: 0, w: 9, h: 4 },
        { i: id3, x: 0, y: 4, w: 12, h: 4 },
      ],
    }
  }

  getTools(): AiTool[] {
    return aiTools
  }

  async executeToolCall(call: ToolCall): Promise<ToolResult> {
    await new Promise(r => setTimeout(r, 300))
    return executeToolCall(call)
  }

  async chat(prompt: string, _currentSpec: DashboardSpec): Promise<ToolCall[]> {
    await new Promise(r => setTimeout(r, 500))
    const lp = prompt.toLowerCase()

    if (lp.includes('sales') || lp.includes('revenue')) {
      return [
        { name: 'set_dashboard_name', params: { name: `Sales Dashboard` } },
        { name: 'add_filter_widget', params: { title: 'Region', datasetId: 'sales', field: 'region', displayType: 'button-group', x: 0, y: 0, w: 12, h: 1 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Total Revenue', config: { label: 'Revenue', prefix: '$', color: '#3b82f6' }, datasetId: 'sales', x: 0, y: 1, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Total Units', config: { label: 'Units', color: '#22c55e' }, datasetId: 'sales', x: 3, y: 1, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Avg Revenue', config: { label: 'Avg Rev', prefix: '$', color: '#8b5cf6' }, datasetId: 'sales', x: 6, y: 1, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Peak Month', config: { label: 'Peak', prefix: '$', color: '#f59e0b' }, datasetId: 'sales', x: 9, y: 1, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'chart', title: 'Monthly Revenue', config: { chartType: 'bar', xField: 'month', yField: 'revenue', color: '#3b82f6' }, datasetId: 'sales', x: 0, y: 3, w: 6, h: 4 } },
        { name: 'add_widget', params: { type: 'chart', title: 'Revenue Trend', config: { chartType: 'area', xField: 'month', yField: 'revenue', color: '#8b5cf6' }, datasetId: 'sales', x: 6, y: 3, w: 6, h: 4 } },
        { name: 'add_widget', params: { type: 'table', title: 'Sales Details', config: { columns: ['month', 'revenue', 'units', 'region'], pageSize: 12 }, datasetId: 'sales', x: 0, y: 7, w: 12, h: 4 } },
      ]
    }

    if (lp.includes('portfolio') || lp.includes('invest')) {
      return [
        { name: 'set_dashboard_name', params: { name: 'Portfolio Overview' } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Total Value', config: { label: 'Portfolio Value', prefix: '$', color: '#3b82f6' }, datasetId: 'portfolio', x: 0, y: 0, w: 4, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Top Return', config: { label: 'Best YTD', suffix: '%', color: '#10b981' }, datasetId: 'portfolio', x: 4, y: 0, w: 4, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Holdings', config: { label: 'Assets', color: '#8b5cf6' }, datasetId: 'portfolio', x: 8, y: 0, w: 4, h: 2 } },
        { name: 'add_widget', params: { type: 'chart', title: 'Holdings by Value', config: { chartType: 'bar', xField: 'asset', yField: 'value', color: '#3b82f6' }, datasetId: 'portfolio', x: 0, y: 2, w: 6, h: 4 } },
        { name: 'add_widget', params: { type: 'chart', title: 'Sector Allocation', config: { chartType: 'pie', xField: 'sector', yField: 'value', color: '#8b5cf6' }, datasetId: 'portfolio', x: 6, y: 2, w: 6, h: 4 } },
        { name: 'add_widget', params: { type: 'table', title: 'All Holdings', config: { columns: ['asset', 'sector', 'value', 'weight', 'return_ytd'], pageSize: 10 }, datasetId: 'portfolio', x: 0, y: 6, w: 12, h: 4 } },
      ]
    }

    if (lp.includes('token') || lp.includes('ai') || lp.includes('usage')) {
      return [
        { name: 'set_dashboard_name', params: { name: 'AI Token Usage' } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Total Tokens In', config: { label: 'Tokens In', color: '#3b82f6' }, datasetId: 'tokens', x: 0, y: 0, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Total Tokens Out', config: { label: 'Tokens Out', color: '#8b5cf6' }, datasetId: 'tokens', x: 3, y: 0, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Total Cost', config: { label: 'Cost', prefix: '$', color: '#ef4444' }, datasetId: 'tokens', x: 6, y: 0, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'kpi', title: 'Models Used', config: { label: 'Models', color: '#10b981' }, datasetId: 'tokens', x: 9, y: 0, w: 3, h: 2 } },
        { name: 'add_widget', params: { type: 'chart', title: 'Cost by Model', config: { chartType: 'bar', xField: 'model', yField: 'cost', color: '#ef4444' }, datasetId: 'tokens', x: 0, y: 2, w: 6, h: 4 } },
        { name: 'add_widget', params: { type: 'chart', title: 'Token Volume', config: { chartType: 'area', xField: 'model', yField: 'tokens_in', color: '#3b82f6' }, datasetId: 'tokens', x: 6, y: 2, w: 6, h: 4 } },
        { name: 'add_widget', params: { type: 'table', title: 'Usage Log', config: { columns: ['model', 'tokens_in', 'tokens_out', 'cost', 'date'], pageSize: 10 }, datasetId: 'tokens', x: 0, y: 6, w: 12, h: 4 } },
      ]
    }

    // Default: mixed demo dashboard
    return [
      { name: 'set_dashboard_name', params: { name: `Dashboard: ${prompt.slice(0, 20)}` } },
      { name: 'add_widget', params: { type: 'kpi', title: 'Metric 1', config: { label: 'Revenue', prefix: '$', color: '#3b82f6' }, datasetId: 'sales', x: 0, y: 0, w: 3, h: 2 } },
      { name: 'add_widget', params: { type: 'kpi', title: 'Metric 2', config: { label: 'Units', color: '#22c55e' }, datasetId: 'sales', x: 3, y: 0, w: 3, h: 2 } },
      { name: 'add_widget', params: { type: 'chart', title: 'Chart', config: { chartType: 'line', xField: 'month', yField: 'revenue', color: '#8b5cf6' }, datasetId: 'sales', x: 6, y: 0, w: 6, h: 4 } },
      { name: 'add_widget', params: { type: 'table', title: 'Data', config: { columns: [], pageSize: 10 }, datasetId: 'sales', x: 0, y: 4, w: 12, h: 4 } },
    ]
  }
}
