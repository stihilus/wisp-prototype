import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { downIcon, filesIcon, folderIcon, globeIcon, searchIcon, shieldIcon, terminalIcon } from '../assets/icons'
import type { ChatMessage, ToolOutput } from '../data/messages'
import { usePrototype } from '../store/prototype'
import styles from './ToolCard.module.css'

type ToolMessage = Extract<ChatMessage, { role: 'tool' }>
type ActionMessage = Extract<ChatMessage, { role: 'action' }>

const icons = { fetch: globeIcon, search: searchIcon, files: folderIcon, command: terminalIcon, file: filesIcon }

function Output({ output }: { output: ToolOutput }) {
  switch (output.type) {
    case 'command':
      return (
        <div className={styles.body}>
          <p>
            <span className={styles.key}>Command:</span> {output.command}
          </p>
          <p>cwd: {output.cwd}</p>
          <p className={styles.mono}>{output.result}</p>
        </div>
      )
    case 'results':
      return (
        <ol className={styles.results}>
          {output.items.map((r) => (
            <li key={r.url + r.title}>
              <span className={styles.resultTitle}>{r.title}</span>
              <span className={styles.resultUrl}>{r.url}</span>
            </li>
          ))}
        </ol>
      )
    case 'page':
      return (
        <div className={styles.body}>
          <p>{output.status}</p>
          <p className={styles.excerpt}>{output.excerpt}</p>
        </div>
      )
    case 'files':
      return (
        <ul className={styles.files}>
          {output.items.map((f) => (
            <li key={f.name}>
              <Icon svg={f.folder ? folderIcon : filesIcon} size={14} />
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.fileMeta}>{f.meta}</span>
            </li>
          ))}
        </ul>
      )
  }
}

/** Fetch Url / Brave Search / List files / Run command — a pill that opens to show what happened */
function CompactCard({ message }: { message: ToolMessage }) {
  const [open, setOpen] = useState(false)
  const kind = message.kind ?? 'fetch'
  const expandable = !!message.output

  return (
    <div className={styles.card} data-open={open || undefined}>
      <button
        type="button"
        className={styles.head}
        onClick={() => expandable && setOpen((v) => !v)}
        aria-expanded={expandable ? open : undefined}
        data-static={!expandable || undefined}
      >
        <Icon svg={icons[kind]} />
        <span className={styles.title}>
          {message.label}
          {message.url && (
            <>
              {' · '}
              <span className={styles.detail}>{message.url}</span>
            </>
          )}
        </span>
        {kind !== 'command' && <Icon svg={shieldIcon} />}
        <Icon svg={downIcon} className={styles.chev} />
      </button>
      {open && message.output && (
        <div className={styles.expanded}>
          <span className={styles.divider} />
          <Output output={message.output} />
        </div>
      )}
    </div>
  )
}

/** a file Wisp wrote — or is still writing */
function FileCard({ title, meta, openWith, writing = false }: { title: string; meta: string; openWith: string; writing?: boolean }) {
  const { actions } = usePrototype()
  return (
    <div className={styles.fileCard} data-writing={writing || undefined}>
      <span className={styles.thumb} aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className={styles.fileText}>
        <span className={styles.fileTitle}>{title}</span>
        <span className={styles.fileSub}>{meta}</span>
      </span>
      {writing && (
        <span className={styles.status}>
          <span className={styles.spinner} />
          Writing file …
        </span>
      )}
      <Icon svg={shieldIcon} className={styles.shield} />
      {writing ? (
        <Icon svg={downIcon} className={styles.chev} />
      ) : (
        <button type="button" className={styles.openButton} onClick={() => actions.toast(`${openWith} isn’t part of this prototype`)}>
          {openWith}
        </button>
      )}
    </div>
  )
}

export function ToolCard({ message }: { message: ToolMessage }) {
  if (message.kind === 'file') {
    return <FileCard title={message.label} meta={message.fileMeta ?? 'Document'} openWith={message.openWith ?? 'Open'} />
  }
  return <CompactCard message={message} />
}

/** Wisp asks before it writes: Allow once / Allow all in this project / Deny */
export function ActionCard({ message }: { message: ActionMessage }) {
  const [state, setState] = useState<'pending' | 'writing' | 'done' | 'denied'>('pending')
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (state !== 'writing') return
    const t = window.setTimeout(() => setState('done'), 1800)
    return () => window.clearTimeout(t)
  }, [state])

  if (state === 'writing' || state === 'done') {
    return <FileCard title={message.fileTitle} meta={message.fileMeta} openWith={message.openWith} writing={state === 'writing'} />
  }

  const pending = state === 'pending'
  return (
    <div className={styles.card} data-open={open || undefined}>
      <button type="button" className={styles.head} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Icon svg={filesIcon} />
        <span className={styles.title}>
          {message.label} · <span className={styles.detail}>{message.detail}</span>
        </span>
        <span className={styles.status} data-tone={pending ? 'wait' : 'denied'}>
          {pending ? 'Awaiting confirmation' : 'Denied'}
        </span>
        <Icon svg={shieldIcon} />
        <Icon svg={downIcon} className={styles.chev} />
      </button>
      {open && (
        <div className={styles.expanded}>
          <span className={styles.divider} />
          <div className={styles.body}>
            <p>
              <span className={styles.key}>Path:</span> {message.path}
            </p>
            <p>{message.summary}</p>
          </div>
          {pending && (
            <>
              <span className={styles.divider} />
              <div className={styles.actions}>
                <button type="button" className={styles.allow} onClick={() => setState('writing')}>
                  Allow once
                </button>
                <button type="button" className={styles.outline} onClick={() => setState('writing')}>
                  Allow all in this project
                </button>
                <button
                  type="button"
                  className={styles.outline}
                  onClick={() => {
                    setState('denied')
                    setOpen(false)
                  }}
                >
                  Deny
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
