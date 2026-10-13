import type { UsageTone } from '../../data/usage'
import styles from './Usage.module.css'

// same geometry as the Figma ring: 16px donut, inner radius 72%
const R = 6.88
const C = 2 * Math.PI * R

/** fills clockwise from 12 o'clock — neutral, amber from 70%, red at 100% */
export function UsageRing({ pct, tone, size = 16 }: { pct: number; tone: UsageTone; size?: number }) {
  const filled = (Math.min(pct, 100) / 100) * C
  return (
    <svg className={styles.ring} data-tone={tone} width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle className={styles.ringTrack} cx="8" cy="8" r={R} />
      <circle
        className={styles.ringProgress}
        cx="8"
        cy="8"
        r={R}
        strokeDasharray={`${filled} ${C}`}
        transform="rotate(-90 8 8)"
      />
    </svg>
  )
}
