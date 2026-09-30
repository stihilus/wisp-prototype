import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { arrange, bottom, compact, type GridItem } from '../../lib/gridLayout'
import styles from './WidgetGrid.module.css'

export type GridRenderContext = {
  /** size in cells — follows the live preview while resizing */
  w: number
  h: number
  active: boolean
}

type WidgetGridProps<T extends GridItem> = {
  items: T[]
  cols: number
  rowHeight: number
  gap: number
  maxRows?: number
  disabled?: boolean
  freshIds?: Record<string, boolean>
  onChange: (layout: GridItem[]) => void
  renderItem: (item: T, ctx: GridRenderContext) => ReactNode
}

type Px = { x: number; y: number; w: number; h: number }

type Interaction = {
  id: string
  mode: 'move' | 'resize'
  pointerId: number
  startClient: { x: number; y: number }
  /** pointer offset inside the item (move) or from its bottom-right corner (resize) */
  grab: { x: number; y: number }
  origin: Px
  startLayout: GridItem[]
  active: boolean
  lastCell: string
  lastClient: { x: number; y: number }
  preview?: GridItem[]
}

type DragView = { id: string; mode: 'move' | 'resize'; px: Px; preview: GridItem[] }

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function WidgetGrid<T extends GridItem>({
  items,
  cols,
  rowHeight,
  gap,
  maxRows = 3,
  disabled,
  freshIds,
  onChange,
  renderItem,
}: WidgetGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [drag, setDrag] = useState<DragView | null>(null)
  const interaction = useRef<Interaction | null>(null)
  const autoScroll = useRef<number | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const colW = width > 0 ? (width - gap * (cols - 1)) / cols : 0
  const pitchX = colW + gap
  const pitchY = rowHeight + gap

  const toPx = (cell: GridItem): Px => ({
    x: cell.x * pitchX,
    y: cell.y * pitchY,
    w: cell.w * colW + (cell.w - 1) * gap,
    h: cell.h * rowHeight + (cell.h - 1) * gap,
  })

  // latest geometry for the window-level listeners
  const geo = useRef({ pitchX, pitchY, colW, cols, gap, rowHeight, maxRows, onChange })
  geo.current = { pitchX, pitchY, colW, cols, gap, rowHeight, maxRows, onChange }

  function update(clientX: number, clientY: number) {
    const it = interaction.current
    const el = containerRef.current
    if (!it || !el) return
    const g = geo.current
    const rect = el.getBoundingClientRect()
    const localX = clientX - rect.left
    const localY = clientY - rect.top
    const item = it.startLayout.find((i) => i.id === it.id)!

    let px: Px
    let next: Partial<GridItem>
    if (it.mode === 'move') {
      px = { ...it.origin, x: localX - it.grab.x, y: localY - it.grab.y }
      next = {
        x: clamp(Math.round(px.x / g.pitchX), 0, g.cols - item.w),
        y: Math.max(0, Math.round(px.y / g.pitchY)),
      }
    } else {
      const w = Math.max(g.colW * 0.7, localX + it.grab.x - it.origin.x)
      const h = Math.max(g.rowHeight * 0.6, localY + it.grab.y - it.origin.y)
      px = { ...it.origin, w, h }
      next = {
        w: clamp(Math.round((w + g.gap) / g.pitchX), 1, g.cols - item.x),
        h: clamp(Math.round((h + g.gap) / g.pitchY), 1, g.maxRows),
      }
    }

    const cellKey = JSON.stringify(next)
    if (!it.preview || it.lastCell !== cellKey) {
      it.preview = arrange(it.startLayout, it.id, next, g.cols, it.mode === 'move')
      it.lastCell = cellKey
    }
    setDrag({ id: it.id, mode: it.mode, px, preview: it.preview })
  }

  function stopAutoScroll() {
    if (autoScroll.current !== null) cancelAnimationFrame(autoScroll.current)
    autoScroll.current = null
  }

  function tickAutoScroll() {
    const it = interaction.current
    const root = containerRef.current?.closest('[data-scroll-root]') as HTMLElement | null
    if (!it || !it.active || !root) {
      autoScroll.current = null
      return
    }
    const r = root.getBoundingClientRect()
    const edge = 72
    const y = it.lastClient.y
    let speed = 0
    if (y > r.bottom - edge) speed = Math.min(18, ((y - (r.bottom - edge)) / edge) * 18)
    else if (y < r.top + edge) speed = -Math.min(18, (((r.top + edge) - y) / edge) * 18)
    if (speed !== 0) {
      root.scrollTop += speed
      update(it.lastClient.x, it.lastClient.y)
    }
    autoScroll.current = requestAnimationFrame(tickAutoScroll)
  }

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const it = interaction.current
      if (!it || event.pointerId !== it.pointerId) return
      it.lastClient = { x: event.clientX, y: event.clientY }
      if (!it.active) {
        const dist = Math.hypot(event.clientX - it.startClient.x, event.clientY - it.startClient.y)
        if (dist < 4) return
        it.active = true
        document.body.dataset.gridDrag = it.mode
        autoScroll.current = requestAnimationFrame(tickAutoScroll)
      }
      event.preventDefault()
      update(event.clientX, event.clientY)
    }

    function onUp(event: PointerEvent) {
      const it = interaction.current
      if (!it || event.pointerId !== it.pointerId) return
      interaction.current = null
      stopAutoScroll()
      delete document.body.dataset.gridDrag
      if (!it.active) return
      if (it.preview) geo.current.onChange(compact(it.preview))
      setDrag(null)
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      stopAutoScroll()
    }
    // the handlers read everything through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onPointerDown(event: ReactPointerEvent, item: T) {
    if (disabled || event.button !== 0 || interaction.current) return
    const target = event.target as HTMLElement
    const resize = target.closest('[data-resize-handle]')
    const handle = target.closest('[data-drag-handle]')
    if (!resize && (!handle || target.closest('button, a, input, textarea, [data-no-drag]'))) return
    const el = containerRef.current
    if (!el) return
    event.preventDefault()
    const rect = el.getBoundingClientRect()
    const origin = toPx(item)
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top
    interaction.current = {
      id: item.id,
      mode: resize ? 'resize' : 'move',
      pointerId: event.pointerId,
      startClient: { x: event.clientX, y: event.clientY },
      grab: resize
        ? { x: origin.x + origin.w - localX, y: origin.y + origin.h - localY }
        : { x: localX - origin.x, y: localY - origin.y },
      origin,
      startLayout: items.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })),
      active: false,
      lastCell: '',
      lastClient: { x: event.clientX, y: event.clientY },
    }
  }

  const layout = drag?.preview ?? items
  const rows = bottom(layout)
  let height = rows > 0 ? rows * pitchY - gap : 0
  if (drag) height = Math.max(height, drag.px.y + drag.px.h)
  const activeCell = drag ? layout.find((i) => i.id === drag.id) : undefined

  return (
    <div ref={containerRef} className={styles.grid} style={{ height }} data-dragging={drag ? drag.mode : undefined}>
      {width > 0 && activeCell && (
        <div
          className={styles.dropShadow}
          style={{ transform: `translate(${toPx(activeCell).x}px, ${toPx(activeCell).y}px)`, width: toPx(activeCell).w, height: toPx(activeCell).h }}
        />
      )}
      {width > 0 &&
        items.map((item) => {
          const cell = layout.find((i) => i.id === item.id) ?? item
          const isActive = drag?.id === item.id
          const px = isActive ? drag.px : toPx(cell)
          return (
            <div
              key={item.id}
              className={styles.item}
              data-active={isActive ? drag.mode : undefined}
              data-fresh={freshIds?.[item.id] || undefined}
              style={{ transform: `translate(${px.x}px, ${px.y}px)`, width: px.w, height: px.h }}
              onPointerDown={(e) => onPointerDown(e, item)}
            >
              <div
                className={styles.itemInner}
                // cards fade in top-to-bottom (row first, then left-to-right) when the grid mounts
                style={{ '--enter-delay': `${60 + item.y * 70 + item.x * 30}ms` } as CSSProperties}
              >
                {renderItem(item, { w: cell.w, h: cell.h, active: isActive })}
              </div>
              {!disabled && (
                <span className={styles.resizeHit} data-resize-handle aria-hidden />
              )}
            </div>
          )
        })}
    </div>
  )
}
