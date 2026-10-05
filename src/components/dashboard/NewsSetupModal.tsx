import { useState } from 'react'
import { Icon } from '../Icon'
import { Modal } from '../ui/Modal'
import { ToolLogo } from './ToolLogo'
import { closeSmallIcon, globeIcon, lockerIcon, searchIcon } from '../../assets/icons'
import { isSite, siteName } from '../../data/dashboard'
import ui from '../ui/controls.module.css'
import styles from './NewsSetupModal.module.css'

const suggestions = ['theverge.com', 'AI privacy', 'Ethereum', 'Anthropic', 'Lido']

/** split "a.com, AI privacy\nLido" into unique terms */
function parse(text: string) {
  const seen = new Set<string>()
  return text
    .split(/[,\n]+/)
    .map((t) => t.trim())
    .filter((t) => {
      const key = t.toLowerCase()
      if (!t || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

type Props = {
  workspaceName: string
  initial?: string[]
  editing?: boolean
  onClose: () => void
  onConfirm: (sources: string[]) => void
}

export function NewsSetupModal({ workspaceName, initial, editing, onClose, onConfirm }: Props) {
  const [text, setText] = useState(initial?.join(', ') ?? '')
  const terms = parse(text)

  const add = (term: string) => {
    if (terms.some((t) => t.toLowerCase() === term.toLowerCase())) return
    setText((current) => {
      const trimmed = current.trim()
      if (!trimmed) return term
      return /[,\n]$/.test(trimmed) ? `${trimmed} ${term}` : `${trimmed}, ${term}`
    })
  }

  const remove = (term: string) => setText(terms.filter((t) => t !== term).join(', '))

  return (
    <Modal onClose={onClose} width={520} label="Follow the news">
      <form
        className={styles.body}
        onSubmit={(e) => {
          e.preventDefault()
          if (terms.length) onConfirm(terms)
        }}
      >
        <div className={styles.head}>
          <div className={styles.titleRow}>
            <ToolLogo kind="news" size={28} />
            <h2 className={styles.title}>{editing ? 'Edit what Wisp follows' : 'Follow the news'}</h2>
          </div>
          <p className={styles.sub}>
            Tell Wisp what to keep an eye on — websites, topics or companies. It searches the web privately and brings back
            what’s new, right on {workspaceName}.
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor="news-sources" className={ui.sectionLabel}>
            What should Wisp follow?
          </label>
          <textarea
            id="news-sources"
            className={styles.input}
            rows={3}
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Paste a link or type a topic or company — e.g. theverge.com, confidential computing, Anthropic. Separate several with commas."
          />
          <div className={styles.suggest}>
            <span className={styles.suggestLabel}>Try</span>
            {suggestions.map((s) => {
              const used = terms.some((t) => t.toLowerCase() === s.toLowerCase())
              return (
                <button key={s} type="button" className={styles.suggestChip} disabled={used} onClick={() => add(s)}>
                  + {s}
                </button>
              )
            })}
          </div>
        </div>

        {terms.length > 0 && (
          <div className={styles.preview}>
            <span className={ui.sectionLabel}>Wisp will follow</span>
            <div className={styles.terms}>
              {terms.map((t) => {
                const site = isSite(t)
                return (
                  <span key={t} className={styles.term} data-kind={site ? 'site' : 'topic'}>
                    <Icon svg={site ? globeIcon : searchIcon} size={12} />
                    {site ? siteName(t) : t}
                    <button type="button" className={styles.termRemove} onClick={() => remove(t)} aria-label={`Remove ${t}`}>
                      <Icon svg={closeSmallIcon} size={10} />
                    </button>
                  </span>
                )
              })}
            </div>
            <p className={styles.previewNote}>About 5 new stories a day · a small widget shows one at a time, a tall one lists them all.</p>
          </div>
        )}

        <p className={styles.lock}>
          <Icon svg={lockerIcon} size={12} />
          Searches run in the enclave — the sites never see who’s asking.
        </p>

        <div className={styles.actions}>
          <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`${ui.btn} ${ui.btnInvert}`} disabled={!terms.length}>
            {editing ? 'Save' : 'Add widget'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
