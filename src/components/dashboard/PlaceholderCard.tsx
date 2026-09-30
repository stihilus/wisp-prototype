import { Icon } from '../Icon'
import { ToolLogo } from './ToolLogo'
import { closeSmallIcon, gripIcon, lockerIcon, resizeHandleIcon } from '../../assets/icons'
import { placeholderChats, placeholderEmails, placeholderMeta, type Placeholder } from '../../data/dashboard'
import ui from '../ui/controls.module.css'
import styles from './PlaceholderCard.module.css'

type PlaceholderCardProps = {
  placeholder: Placeholder
  size: { w: number; h: number }
  connecting: boolean
  onConnect: () => void
  onHide: () => void
  onRequest: () => void
  onBrowse: () => void
}

const exampleBars = [26, 34, 22, 44, 38, 50, 30, 62]

function Example({ placeholder, size }: { placeholder: Placeholder; size: { w: number; h: number } }) {
  switch (placeholder.id) {
    case 'telegram':
      return (
        <div className={styles.rows}>
          {placeholderChats.map((c) => (
            <div key={c.name} className={styles.chat}>
              <span className={styles.avatar} style={{ background: c.color }}>
                {c.initials}
              </span>
              <div className={styles.chatText}>
                <span className={styles.exTitle}>
                  {c.name} · {c.count} new
                </span>
                <span className={styles.exText}>{c.text}</span>
              </div>
            </div>
          ))}
        </div>
      )
    case 'gmail':
      return (
        <div className={styles.rows}>
          {placeholderEmails.map((e) => (
            <div key={e.title} className={styles.email}>
              <span className={styles.exTitle}>{e.title}</span>
              <span className={styles.exText}>{e.sub}</span>
            </div>
          ))}
        </div>
      )
    case 'calendar':
      return (
        <div className={styles.stack}>
          <span className={styles.exTitle}>In 25 min · Team check-in</span>
          <span className={styles.exText}>Anna, Mark, Sofia</span>
        </div>
      )
    case 'granola':
      return (
        <div className={styles.stack}>
          <span className={styles.exTitle}>Send the signed contract to Sarah</span>
        </div>
      )
    case 'linear':
      return (
        <div className={styles.stack}>
          <span className={styles.exTitle}>14 closed · 6 in progress</span>
        </div>
      )
    case 'custom':
      return (
        <div className={styles.customExample} data-wide={size.w >= 2}>
          <div className={styles.exampleBars}>
            {exampleBars.map((h, i) => (
              <span key={i} style={{ height: h * (size.h >= 2 ? 1.6 : 1) }} />
            ))}
          </div>
          <span className={styles.exText}>e.g. issues closed each week in Linear, or ad spend from your own MCP</span>
        </div>
      )
    case 'more':
      return (
        <div className={styles.moreLogos}>
          <ToolLogo kind="notion" size={24} />
          <ToolLogo kind="drive" size={24} />
        </div>
      )
  }
}

export function PlaceholderCard({ placeholder, size, connecting, onConnect, onHide, onRequest, onBrowse }: PlaceholderCardProps) {
  const meta = placeholderMeta[placeholder.id]
  const big = size.w >= 2 && size.h >= 2
  const isTool = !!meta.connects

  let primaryLabel = 'Connect'
  if (placeholder.id === 'telegram') primaryLabel = 'Connect Telegram'
  if (placeholder.id === 'gmail') primaryLabel = 'Connect Gmail'
  if (placeholder.id === 'custom') primaryLabel = 'Create a widget'
  if (placeholder.id === 'more') primaryLabel = 'Browse'

  return (
    <article className={styles.card} data-kind={placeholder.id}>
      <header className={styles.header} data-drag-handle>
        <span className={styles.grip}>
          <Icon svg={gripIcon} size={14} />
        </span>
        <ToolLogo kind={meta.logo} size={24} />
        <span className={styles.name}>{meta.name}</span>
      </header>

      <h3 className={styles.title} data-big={big}>
        {meta.title}
      </h3>

      <div className={styles.example}>
        <Example placeholder={placeholder} size={size} />
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={`${ui.btn} ${ui.btnSm} ${ui.btnSecondary}`}
          onClick={placeholder.id === 'more' ? onBrowse : onConnect}
          disabled={connecting}
          data-no-drag
        >
          {connecting && <span className={ui.spinner} />}
          {connecting ? (isTool ? 'Connecting…' : 'Building…') : primaryLabel}
        </button>
        {isTool ? (
          <span className={styles.local}>
            <Icon svg={lockerIcon} size={12} />
            Read on this Mac
          </span>
        ) : (
          <button type="button" className={ui.link} onClick={onRequest} data-no-drag>
            {placeholder.id === 'custom' ? 'Request a widget' : 'Request'}
          </button>
        )}
      </footer>

      <button type="button" className={styles.hide} onClick={onHide} aria-label={`Hide ${meta.name}`} title="Hide — I don’t use this" data-no-drag>
        <Icon svg={closeSmallIcon} size={12} />
      </button>

      <span className={styles.resizeGlyph} aria-hidden>
        <Icon svg={resizeHandleIcon} size={14} />
      </span>
    </article>
  )
}
