import { useMemo } from 'react'
import type { WidgetSpec } from '@/schemas/dashboard.schema'
import { getWidgetEntry } from '@/registry/widget-registry'
import { useWidgetData } from '@/store/hooks/useWidgetData'
import { useDashboardStore } from '@/store/dashboard.store'
import { compileCustomWidget } from '@/lib/code-runner'
import { Loader2 } from 'lucide-react'

export function WidgetRenderer({ widget }: { widget: WidgetSpec }) {
  const entry = getWidgetEntry(widget.type)
  const { data, isLoading, error } = useWidgetData(widget.dataBinding)
  const updateWidgetConfig = useDashboardStore(s => s.updateWidgetConfig)

  // Compile custom code if present (memoized on code string)
  const CustomComponent = useMemo(
    () => widget.customCode ? compileCustomWidget(widget.customCode) : null,
    [widget.customCode],
  )

  if (!entry && !CustomComponent) return <div className="p-4 text-red-500">Unknown widget: {widget.type}</div>

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-gray-400" /></div>
  if (error) return <div className="p-4 text-red-500 text-sm">Error loading data</div>

  // Use custom code if available, otherwise default component
  if (CustomComponent) {
    return <CustomComponent config={widget.config} data={data ?? null} width={0} height={0} />
  }

  const Component = entry!.component

  // Pass onConfigChange for container widgets so cell edits persist
  const extraProps = widget.type === 'container'
    ? { widgetId: widget.id, onConfigChange: (config: Record<string, unknown>) => updateWidgetConfig(widget.id, config) }
    : {}

  return <Component config={widget.config} data={data ?? null} width={0} height={0} {...extraProps} />
}
