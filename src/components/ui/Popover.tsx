import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Popover.module.css'

export type Placement = 'bottom-end' | 'bottom-start' | 'top-start' | 'top-end' | 'right-start' | 'right-end'

type PopoverProps = {
  anchor: HTMLElement | null
  onClose: () => void
  placement?: Placement
  offset?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
  /** extra elements whose clicks shouldn't count as "outside" */
  ignore?: (HTMLElement | null)[]
}

const MARGIN = 12

// Fixed-position floating panel rendered into <body>, so it never gets
// clipped by the scrolling dashboard or a widget's overflow.
export function Popover({ anchor, onClose, placement = 'bottom-end', offset = 8, className, style, children, ignore = [] }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const ignoreRef = useRef(ignore)
  ignoreRef.current = ignore

  const measure = useCallback(() => {
    const el = ref.current
    if (!el || !anchor) return
    const a = anchor.getBoundingClientRect()
    const w = el.offsetWidth
    const h = el.offsetHeight
    let left = 0
    let top = 0
    switch (placement) {
      case 'bottom-end':
        left = a.right - w
        top = a.bottom + offset
        break
      case 'bottom-start':
        left = a.left
        top = a.bottom + offset
        break
      case 'top-start':
        left = a.left
        top = a.top - offset - h
        break
      case 'top-end':
        left = a.right - w
        top = a.top - offset - h
        break
      case 'right-start':
        left = a.right + offset
        top = a.top
        break
      case 'right-end':
        left = a.right + offset
        top = a.bottom - h
        break
    }
    // flip below → above when there is no room
    if (placement.startsWith('bottom') && top + h > window.innerHeight - MARGIN && a.top - offset - h > MARGIN) {
      top = a.top - offset - h
    }
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - w - MARGIN))
    top = Math.max(MARGIN, Math.min(top, window.innerHeight - h - MARGIN))
    setPos({ left, top })
  }, [anchor, offset, placement])

  useLayoutEffect(() => {
    measure()
  }, [measure, children])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (ref.current?.contains(target)) return
      if (anchor?.contains(target)) return
      if (ignoreRef.current.some((el) => el?.contains(target))) return
      onCloseRef.current()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [anchor])

  return createPortal(
    <div
      ref={ref}
      className={`${styles.popover} ${className ?? ''}`}
      data-placement={placement}
      data-ready={pos !== null}
      style={{ ...style, left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  )
}
