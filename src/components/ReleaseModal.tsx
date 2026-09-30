import { useEffect } from 'react'
import { Icon } from './Icon'
import { closeIcon } from '../assets/icons'
import styles from './ReleaseModal.module.css'

type ReleaseModalProps = {
  onClose: () => void
  onTryModel: () => void
  onSeeAllUpdates: () => void
}

export function ReleaseModal({ onClose, onTryModel, onSeeAllUpdates }: ReleaseModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={styles.left}>
          <span className={styles.badge}>NEW IN 2.4</span>

          <div className={styles.title}>
            <h2>Wisp 2.4 is here</h2>
            <p>Two things worth knowing about:</p>
          </div>

          <div className={styles.list}>
            <div className={styles.item}>
              <span className={styles.number}>1</span>
              <div className={styles.itemContent}>
                <div className={styles.itemHeading}>
                  <h3>Muse Glimmer 30B in the model picker</h3>
                  <span className={styles.newsTag}>New model</span>
                </div>
                <p>
                  A dependable model for tool use and multi-step tasks — it also reads images. Great for triaging
                  connector data or working through a checklist without losing the thread.
                </p>
              </div>
            </div>
            <div className={styles.item}>
              <span className={styles.number}>2</span>
              <div className={styles.itemContent}>
                <div className={styles.itemHeading}>
                  <h3>Live transcript panel</h3>
                </div>
                <p>Follow a call in a floating window that stays out of screenshots and screen recordings.</p>
              </div>
            </div>
          </div>

          <div className={styles.spacer} />

          <div className={styles.actions}>
            <button type="button" className={styles.ctaButton} onClick={onTryModel}>
              Try Muse Glimmer 30B
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onSeeAllUpdates}>
              See all updates
            </button>
          </div>
        </div>

        <div className={styles.visual}>
          <p className={styles.visualTitle}>Release visual</p>
          <p className={styles.visualSubtitle}>Drop a screenshot or animation here</p>
        </div>

        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
          <Icon svg={closeIcon} />
        </button>
      </div>
    </div>
  )
}
