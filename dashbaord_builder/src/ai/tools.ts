import type { DashboardSpec } from '@/schemas/dashboard.schema'

export interface AiTool {
  name: string
  description: string
  parameters: Record<string, { type: string; description: string; required?: boolean; enum?: string[] }>
}

export const aiTools: AiTool[] = [
  {
    name: 'add_widget',
    description: 'Add a new widget to the dashboard',
    parameters: {
      type: { type: 'string', description: 'Widget type', required: true, enum: ['kpi', 'chart', 'table', 'text', 'filter'] },
      title: { type: 'string', description: 'Widget title', required: true },
      config: { type: 'object', description: 'Widget configuration (chartType, xField, yField, color, label, prefix, suffix, etc.)' },
      datasetId: { type: 'string', description: 'Dataset to bind to' },
      x: { type: 'number', description: 'Grid x position (0-11)' },
      y: { type: 'number', description: 'Grid y position' },
      w: { type: 'number', description: 'Grid width (1-12)' },
      h: { type: 'number', description: 'Grid height' },
    },
  },
  {
    name: 'remove_widget',
    description: 'Remove a widget by ID',
    parameters: {
      id: { type: 'string', description: 'Widget ID to remove', required: true },
    },
  },
  {
    name: 'update_widget_config',
    description: 'Update configuration fields on a widget',
    parameters: {
      id: { type: 'string', description: 'Widget ID', required: true },
      config: { type: 'object', description: 'Config fields to update', required: true },
    },
  },
  {
    name: 'update_widget_title',
    description: 'Set widget title',
    parameters: {
      id: { type: 'string', description: 'Widget ID', required: true },
      title: { type: 'string', description: 'New title', required: true },
    },
  },
  {
    name: 'set_data_binding',
    description: 'Bind a widget to a dataset',
    parameters: {
      id: { type: 'string', description: 'Widget ID', required: true },
      datasetId: { type: 'string', description: 'Dataset ID', required: true },
    },
  },
  {
    name: 'update_layout',
    description: 'Move or resize a widget',
    parameters: {
      id: { type: 'string', description: 'Widget ID', required: true },
      x: { type: 'number', description: 'Grid x position' },
      y: { type: 'number', description: 'Grid y position' },
      w: { type: 'number', description: 'Grid width' },
      h: { type: 'number', description: 'Grid height' },
    },
  },
  {
    name: 'set_dashboard_name',
    description: 'Rename the dashboard',
    parameters: {
      name: { type: 'string', description: 'New dashboard name', required: true },
    },
  },
  {
    name: 'add_filter_widget',
    description: 'Add a filter widget that controls data filtering for other widgets on the same dataset',
    parameters: {
      title: { type: 'string', description: 'Widget title', required: true },
      datasetId: { type: 'string', description: 'Dataset to filter', required: true },
      field: { type: 'string', description: 'Field to filter on', required: true },
      displayType: { type: 'string', description: 'Display type', enum: ['dropdown', 'button-group', 'date-range'] },
      options: { type: 'array', description: 'Explicit options (auto-populated if empty)' },
      x: { type: 'number', description: 'Grid x position (0-11)' },
      y: { type: 'number', description: 'Grid y position' },
      w: { type: 'number', description: 'Grid width (1-12)' },
      h: { type: 'number', description: 'Grid height' },
    },
  },
  {
    name: 'list_widgets',
    description: 'Return current widget list (read-only)',
    parameters: {},
  },
  {
    name: 'list_datasets',
    description: 'Return available datasets (read-only)',
    parameters: {},
  },
  {
    name: 'get_dashboard_spec',
    description: 'Return full current dashboard spec as JSON',
    parameters: {},
  },
]
