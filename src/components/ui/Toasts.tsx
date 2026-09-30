import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { closeSmallIcon } from '../../assets/icons'
import { usePrototype } from '../../store/prototype'
import styles from './Toasts.module.css'

export function Toasts() {
  const { toasts, actions } = usePrototype()
  if (!toasts.length) return null
  return createPortal(
    <div className={styles.stack} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast}>
          <span className={styles.text}>{t.text}</span>
          {t.actionLabel && (
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                t.onAction?.()
                actions.dismissToast(t.id)
              }}
            >
              {t.actionLabel}
            </button>
          )}
          <button type="button" className={styles.close} aria-label="Dismiss" onClick={() => actions.dismissToast(t.id)}>
            <Icon svg={closeSmallIcon} size={12} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
