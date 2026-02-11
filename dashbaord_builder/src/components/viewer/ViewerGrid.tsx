import { useRef, useState, useEffect } from 'react'
import { Responsive } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { DashboardSpec } from '@/schemas/dashboard.schema'
import { WidgetFrame } from '@/components/widgets/WidgetFrame'
import { WidgetRenderer } from './WidgetRenderer'

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

const FIXED_RATIOS = { 'portrait-fixed': 0.75, 'landscape-fixed': 16 / 9 } as const

export function ViewerGrid({ spec }: { spec: DashboardSpec }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rawWidth = useWidth(containerRef)

  const layoutMode = spec.pageSettings?.layoutMode ?? 'scrollable'
  const pageWidth = spec.pageSettings?.pageWidth ?? 1200
  const rowHeight = spec.pageSettings?.rowHeight ?? 80
  const isFixed = layoutMode === 'portrait-fixed' || layoutMode === 'landscape-fixed'
  const gridWidth = isFixed ? pageWidth : Math.min(rawWidth, pageWidth)
  const pageHeight = isFixed
    ? Math.round(pageWidth / FIXED_RATIOS[layoutMode as keyof typeof FIXED_RATIOS])
    : 0

  return (
    <div
      ref={containerRef}
      className={`min-w-0 p-4 ${isFixed ? 'overflow-auto' : 'overflow-y-auto'}`}
    >
      {gridWidth > 0 && (
        <div
          className="mx-auto page-contour rounded-lg"
          style={{
            maxWidth: `${pageWidth}px`,
            ...(isFixed ? { width: `${pageWidth}px`, minHeight: `${pageHeight}px` } : {}),
          }}
        >
          <Responsive
            width={gridWidth}
            layouts={{ lg: spec.layout.map(l => ({ ...l, static: true })) }}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={rowHeight}
            isDraggable={false}
            isResizable={false}
            compactType="vertical"
          >
            {spec.widgets.map(widget => (
              <div key={widget.id}>
                <WidgetFrame id={widget.id} title={widget.title} isSelected={false} editable={false}>
                  <WidgetRenderer widget={widget} />
                </WidgetFrame>
              </div>
            ))}
          </Responsive>
        </div>
      )}
    </div>
  )
}
