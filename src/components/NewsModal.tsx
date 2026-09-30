import { useEffect } from 'react'
import { Icon } from './Icon'
import { circleCheckIcon, closeIcon, linkExitIcon } from '../assets/icons'
import styles from './NewsModal.module.css'

type NewsModalProps = {
  onClose: () => void
  onTryModel: () => void
}

type TagKind = 'new-model' | 'new' | 'improved' | 'fixed'

function NewsTag({ kind }: { kind: TagKind }) {
  if (kind === 'new-model') return <span className={`${styles.tag} ${styles.tagSuccess}`}>New model</span>
  if (kind === 'new') return <span className={`${styles.tag} ${styles.tagBrand}`}>New</span>
  if (kind === 'improved') return <span className={`${styles.tag} ${styles.tagNeutral}`}>Improved</span>
  return <span className={`${styles.tag} ${styles.tagOutline}`}>Fixed</span>
}

type Entry = {
  tag: TagKind
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function NewsModal({ onClose, onTryModel }: NewsModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const releases: { version: string; date: string; latest?: boolean; entries: Entry[] }[] = [
    {
      version: '2.4.0',
      date: '7 September 2026',
      latest: true,
      entries: [
        {
          tag: 'new-model',
          title: 'Muse Glimmer 30B is in the model picker',
          description:
            'A dependable model for tool use and multi-step tasks, running inside the same enclave. Nothing about how your data is handled changes.',
          action: { label: 'Try', onClick: onTryModel },
        },
        {
          tag: 'new',
          title: 'Live transcript panel',
          description: 'Follow a call in a floating window that stays out of screenshots and screen recordings.',
        },
        {
          tag: 'improved',
          title: 'Connectors sync in the background',
          description: 'Notion and Linear refresh without blocking the chat.',
        },
        {
          tag: 'fixed',
          title: 'Recordings no longer drop the last seconds',
          description: 'Stopping from the menu bar now flushes the final buffer before closing.',
        },
      ],
    },
    {
      version: '2.3.2',
      date: '22 August 2026',
      entries: [
        {
          tag: 'improved',
          title: 'Skills accept .zip up to 50 MB',
          description: 'Bigger skill bundles upload without splitting them first.',
        },
        {
          tag: 'fixed',
          title: 'Revoked Telegram sessions stayed connected',
          description: 'Revoking on Telegram now disconnects the connector right away.',
        },
      ],
    },
    {
      version: '2.3.0',
      date: '9 August 2026',
      entries: [
        {
          tag: 'new',
          title: 'Transcript tags',
          description: 'Label recordings while they run, or after. Wisp suggests tags it hears in the conversation.',
        },
        {
          tag: 'new',
          title: 'Email drafts in chat',
          description: 'Ask Wisp for an email and edit it in place. Nothing sends until you press Send.',
        },
      ],
    },
  ]

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2>What's new</h2>
            <p>Everything we shipped, newest first.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon svg={closeIcon} size={20} />
          </button>
        </div>

        <div className={`${styles.body} thin-scroll`}>
          {releases.map((release, index) => (
            <div key={release.version}>
              {index > 0 && <div className={styles.divider} />}
              <div className={styles.release}>
                <div className={styles.releaseHeader}>
                  <span className={styles.version}>{release.version}</span>
                  <span className={styles.date}>{release.date}</span>
                  {release.latest && <span className={`${styles.tag} ${styles.tagBrand}`}>Latest</span>}
                </div>
                <div className={styles.entries}>
                  {release.entries.map((entry) => (
                    <div key={entry.title} className={styles.entry}>
                      <div className={styles.entryTag}>
                        <NewsTag kind={entry.tag} />
                      </div>
                      <div className={styles.entryText}>
                        <p className={styles.entryTitle}>{entry.title}</p>
                        <p className={styles.entryDescription}>{entry.description}</p>
                      </div>
                      {entry.action && (
                        <button type="button" className={styles.entryAction} onClick={entry.action.onClick}>
                          {entry.action.label}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.status}>
            <Icon svg={circleCheckIcon} size={14} />
            <span>You're on 2.4.0 — up to date</span>
          </div>
          <a className={styles.changelogLink} href="#" onClick={(e) => e.preventDefault()}>
            Full changelog
            <Icon svg={linkExitIcon} size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
