import { useRef, useState, useEffect, useMemo } from 'react'
import { Responsive } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useDashboardStore } from '@/store/dashboard.store'
import { WidgetFrame } from '@/components/widgets/WidgetFrame'
import { WidgetRenderer } from '@/components/viewer/WidgetRenderer'
import type { WidgetSpec } from '@/schemas/dashboard.schema'
import type { Layout } from 'react-grid-layout'
import { WIDGET_TYPE_DEFAULTS } from '@/registry/widget-registry'

function useWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const obs = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return width
}

// Fixed page aspect ratios (width:height)
const FIXED_RATIOS = { 'portrait-fixed': 0.75, 'landscape-fixed': 16 / 9 } as const

export function GridCanvas() {
  const spec = useDashboardStore(s => s.spec)
  const selectedWidgetId = useDashboardStore(s => s.selectedWidgetId)
  const updateLayout = useDashboardStore(s => s.updateLayout)
  const selectWidget = useDashboardStore(s => s.selectWidget)
  const addWidget = useDashboardStore(s => s.addWidget)
  const containerRef = useRef<HTMLDivElement>(null)
  const rawWidth = useWidth(containerRef)

  const layoutMode = spec.pageSettings?.layoutMode ?? 'scrollable'
  const pageWidth = spec.pageSettings?.pageWidth ?? 1200
  const rowHeight = spec.pageSettings?.rowHeight ?? 80
  const isFixed = layoutMode === 'portrait-fixed' || layoutMode === 'landscape-fixed'
  const gridWidth = isFixed ? pageWidth : Math.min(rawWidth, pageWidth)

  // For fixed modes, compute page height from aspect ratio
  const pageHeight = isFixed
    ? Math.round(pageWidth / FIXED_RATIOS[layoutMode as keyof typeof FIXED_RATIOS])
    : 0

  // Check if any widget overflows the fixed page boundary
  const hasOverflow = useMemo(() => {
    if (!isFixed || !pageHeight) return false
    const gap = 10 // react-grid-layout default margin
    for (const l of spec.layout) {
      const bottom = l.y * (rowHeight + gap) + l.h * (rowHeight + gap)
      if (bottom > pageHeight) return true
    }
    return false
  }, [isFixed, pageHeight, spec.layout, rowHeight])

  function syncLayout(layout: Layout[]) {
    updateLayout(layout.map(l => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h })))
  }

  function handleDrop(_layout: Layout[], layoutItem: Layout, e: DragEvent) {
    const widgetType = e.dataTransfer?.getData('widgetType') as WidgetSpec['type'] | undefined
    if (!widgetType) return
    const id = addWidget(widgetType)
    const defaults = WIDGET_TYPE_DEFAULTS[widgetType]
    updateLayout([
      ...spec.layout.filter(l => l.i !== id),
      { i: id, x: layoutItem.x, y: layoutItem.y, w: defaults?.defaultSize.w ?? 4, h: defaults?.defaultSize.h ?? 3 },
    ])
  }

  return (
    <div
      className={`flex-1 bg-gray-100 p-4 min-w-0 ${isFixed ? 'overflow-auto' : 'overflow-y-auto'}`}
      onClick={() => selectWidget(null)}
      ref={containerRef}
    >
      {gridWidth > 0 && (
        <div
          className={`mx-auto relative page-contour rounded-lg ${isFixed && hasOverflow ? 'page-contour-overflow' : ''}`}
          style={{
            maxWidth: `${pageWidth}px`,
            ...(isFixed ? { width: `${pageWidth}px`, minHeight: `${pageHeight}px` } : {}),
          }}
        >
          {/* Fixed page boundary line */}
          {isFixed && (
            <div
              className="absolute left-0 right-0 pointer-events-none z-10"
              style={{ top: `${pageHeight}px` }}
            >
              <div className={`border-t-2 border-dashed ${hasOverflow ? 'border-red-400' : 'border-slate-300'}`} />
              {hasOverflow && (
                <span className="absolute right-2 -top-5 text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                  Content exceeds page
                </span>
              )}
            </div>
          )}
          <Responsive
            width={gridWidth}
            layouts={{ lg: spec.layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={rowHeight}
            isDraggable
            isResizable
            isDroppable
            onDragStop={syncLayout}
            onResizeStop={syncLayout}
            onDrop={handleDrop}
            droppingItem={{ i: '__dropping', w: 4, h: 3 }}
            compactType="vertical"
          >
            {spec.widgets.map(widget => (
              <div key={widget.id}>
                <WidgetFrame id={widget.id} title={widget.title} isSelected={widget.id === selectedWidgetId} editable>
                  <WidgetRenderer widget={widget} />
                </WidgetFrame>
              </div>
            ))}
          </Responsive>
        </div>
      )}
      {spec.widgets.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          Drag widgets from the palette or click to add
        </div>
      )}
    </div>
  )
}
