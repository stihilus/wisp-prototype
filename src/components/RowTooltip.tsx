import { createPortal } from 'react-dom'
import styles from './RowTooltip.module.css'

type RowTooltipProps = {
  label: string
  pos: { x: number; y: number } | null
  side: 'right' | 'left' | 'top'
}

export function RowTooltip({ label, pos, side }: RowTooltipProps) {
  if (!pos) return null
  return createPortal(
    <div className={styles.tooltip} data-side={side} style={{ left: pos.x, top: pos.y }}>
      {label}
    </div>,
    document.body,
  )
}
