import { registerWidget } from './widget-registry'
import { kpiConfigSchema, chartConfigSchema, tableConfigSchema, textConfigSchema, containerConfigSchema, filterConfigSchema } from '@/schemas/widget-configs.schema'
import { KpiWidget } from '@/components/widgets/KpiWidget'
import { ChartWidget } from '@/components/widgets/ChartWidget'
import { TableWidget } from '@/components/widgets/TableWidget'
import { TextWidget } from '@/components/widgets/TextWidget'
import { ContainerWidget } from '@/components/widgets/ContainerWidget'
import { FilterWidget } from '@/components/widgets/FilterWidget'

export function registerAllWidgets() {
  registerWidget({
    type: 'kpi',
    label: 'KPI',
    icon: 'TrendingUp',
    configSchema: kpiConfigSchema,
    defaultConfig: kpiConfigSchema.parse({}),
    component: KpiWidget,
    defaultSize: { w: 3, h: 2 },
  })
  registerWidget({
    type: 'chart',
    label: 'Chart',
    icon: 'BarChart3',
    configSchema: chartConfigSchema,
    defaultConfig: chartConfigSchema.parse({}),
    component: ChartWidget,
    defaultSize: { w: 6, h: 4 },
  })
  registerWidget({
    type: 'table',
    label: 'Table',
    icon: 'Table',
    configSchema: tableConfigSchema,
    defaultConfig: tableConfigSchema.parse({}),
    component: TableWidget,
    defaultSize: { w: 6, h: 4 },
  })
  registerWidget({
    type: 'text',
    label: 'Text',
    icon: 'Type',
    configSchema: textConfigSchema,
    defaultConfig: textConfigSchema.parse({}),
    component: TextWidget,
    defaultSize: { w: 4, h: 2 },
  })
  registerWidget({
    type: 'container',
    label: 'Container',
    icon: 'LayoutGrid',
    configSchema: containerConfigSchema,
    defaultConfig: containerConfigSchema.parse({}),
    component: ContainerWidget,
    defaultSize: { w: 6, h: 4 },
  })
  registerWidget({
    type: 'filter',
    label: 'Filter',
    icon: 'Filter',
    configSchema: filterConfigSchema,
    defaultConfig: filterConfigSchema.parse({}),
    component: FilterWidget,
    defaultSize: { w: 4, h: 1 },
  })
}
