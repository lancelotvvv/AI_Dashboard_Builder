import type { WidgetProps } from '@/registry/widget-registry'
import type { TextConfig } from '@/schemas/widget-configs.schema'

const sizeMap = { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' } as const

export function TextWidget({ config }: WidgetProps) {
  const c = config as TextConfig
  return (
    <div className={`p-4 h-full overflow-auto ${sizeMap[c.fontSize ?? 'base']}`}>
      <p className="whitespace-pre-wrap">{c.content}</p>
    </div>
  )
}
