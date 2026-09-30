import { createPortal } from 'react-dom'
import styles from './TourCursor.module.css'

type TourCursorProps = {
  x: number
  y: number
  visible: boolean
  tapping: boolean
}

export function TourCursor({ x, y, visible, tapping }: TourCursorProps) {
  return createPortal(
    <div className={styles.cursor} data-visible={visible} data-tapping={tapping} style={{ left: x, top: y }} />,
    document.body,
  )
}
