import { useCallback, useRef, useState } from 'react'

type Side = 'right' | 'left' | 'top'

export function useRowTooltip<T extends HTMLElement>(side: Side = 'right') {
  const ref = useRef<T | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const onMouseEnter = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    if (side === 'right') setPos({ x: rect.right + 10, y: rect.top + rect.height / 2 })
    else if (side === 'left') setPos({ x: rect.left - 10, y: rect.top + rect.height / 2 })
    else setPos({ x: rect.left + rect.width / 2, y: rect.top - 10 })
  }, [side])

  const onMouseLeave = useCallback(() => setPos(null), [])

  return { ref, pos, side, onMouseEnter, onMouseLeave }
}
