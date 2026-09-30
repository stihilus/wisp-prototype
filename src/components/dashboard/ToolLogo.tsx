import { Icon } from '../Icon'
import { addSmallIcon, sparkleBrandIcon } from '../../assets/icons'
import {
  logoDrive,
  logoGmailAlt,
  logoGoogleCalendar,
  logoGranola,
  logoHealth,
  logoLinear,
  logoNotion,
  logoPosthog,
  logoTelegram,
} from '../../assets/logos'
import type { WidgetKind } from '../../data/dashboard'
import styles from './ToolLogo.module.css'

type LogoKind = WidgetKind | 'custom' | 'more'

// how each brand mark sits inside the neutral 24px tile
const marks: Partial<Record<LogoKind, { src: string; fit: 'bleed' | 'cover' | 'contain' | 'white'; scale: number }>> = {
  telegram: { src: logoTelegram, fit: 'bleed', scale: 1 },
  gmail: { src: logoGmailAlt, fit: 'contain', scale: 0.62 },
  calendar: { src: logoGoogleCalendar, fit: 'cover', scale: 0.75 },
  granola: { src: logoGranola, fit: 'cover', scale: 0.75 },
  linear: { src: logoLinear, fit: 'cover', scale: 0.75 },
  notion: { src: logoNotion, fit: 'cover', scale: 0.75 },
  drive: { src: logoDrive, fit: 'contain', scale: 0.66 },
  posthog: { src: logoPosthog, fit: 'contain', scale: 0.74 },
  health: { src: logoHealth, fit: 'white', scale: 0.66 },
}

export function ToolLogo({ kind, size = 24, className }: { kind: LogoKind; size?: number; className?: string }) {
  const mark = marks[kind]
  const radius = Math.round(size / 4)
  const tileStyle = { width: size, height: size, borderRadius: radius }

  if (!mark) {
    const isMore = kind === 'more'
    return (
      <span className={`${styles.tile} ${isMore ? '' : styles.custom} ${className ?? ''}`} style={tileStyle} aria-hidden>
        <Icon svg={isMore ? addSmallIcon : sparkleBrandIcon} size={Math.round(size * 0.58)} />
      </span>
    )
  }

  const inner = Math.round(size * mark.scale)
  return (
    <span className={`${styles.tile} ${className ?? ''}`} data-fit={mark.fit} style={tileStyle} aria-hidden>
      <img
        src={mark.src}
        alt=""
        className={styles.img}
        data-fit={mark.fit}
        style={mark.fit === 'bleed' ? undefined : { width: inner, height: inner, borderRadius: Math.max(3, radius - 1) }}
        draggable={false}
      />
    </span>
  )
}
