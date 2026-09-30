import { Icon } from '../Icon'
import { WidgetCard } from './WidgetCard'
import { ToolLogo } from './ToolLogo'
import { addSmallIcon, refreshIcon, sideMenuCloseIcon, sparkleBrandIcon } from '../../assets/icons'
import { relativeTime, telegramChats, widgetContent, type WidgetKind } from '../../data/dashboard'
import { usePrototype } from '../../store/prototype'
import ui from '../ui/controls.module.css'
import styles from './UpdatesPanel.module.css'

// What needs you first — time-bound things lead, dashboards trail.
const priority: WidgetKind[] = ['calendar', 'granola', 'telegram', 'gmail', 'summary', 'topic', 'linear', 'notion', 'drive', 'posthog', 'health', 'chart']

export function UpdatesPanel({ now }: { now: number }) {
  const { state, activeWorkspace: ws, actions, refreshing } = usePrototype()
  const inChat = state.view === 'chat'
  const widgets = [...ws.widgets].sort((a, b) => priority.indexOf(a.kind) - priority.indexOf(b.kind))

  const telegram = ws.widgets.find((w) => w.kind === 'telegram' && w.preset === 'skipped')
  const gmail = ws.widgets.find((w) => w.kind === 'gmail')
  const parts: string[] = []
  if (telegram) {
    const n = (telegram.scope ? telegramChats.filter((c) => telegram.scope!.includes(c.folder)) : telegramChats).filter((c) => c.needsYou).length
    if (n) parts.push(`${n} ${n === 1 ? 'chat' : 'chats'}`)
  }
  if (gmail) parts.push('2 emails')
  const summary = parts.length
    ? `${parts.join(' and ')} need you`
    : widgets.length
      ? `${widgets.length} ${widgets.length === 1 ? 'widget' : 'widgets'} from ${ws.name}`
      : `Nothing connected in ${ws.name} yet`

  const addAll = () => {
    const contents = widgets.map((w) => ({ kind: w.kind, content: widgetContent(w) }))
    const top = contents.slice(0, 3).map((c) => `• ${c.content.headline}`)
    const kinds = contents.map((c) => c.content.source ?? c.kind)
    const title = `${contents.length} updates from ${ws.name}`
    const detail = contents.map((c) => c.content.headline).join(' · ')
    const reply = `I’ve read all ${contents.length} updates. What stands out:\n\n${top.join('\n')}\n\nWant me to start with the most urgent one?`
    if (inChat) actions.addContext(kinds, title, detail, reply)
    else actions.startChatWithContext(kinds, title, detail, 'What needs me first?', reply)
  }

  const refreshing_ = !!refreshing[ws.id]

  return (
    <aside className={styles.panel} aria-label="Updates">
      <header className={styles.header}>
        <div className={styles.headText}>
          <h2 className={styles.title}>Updates</h2>
          <p className={styles.sub}>{summary}</p>
        </div>
        <div className={styles.headActions}>
          <span className={styles.updated}>{refreshing_ ? 'Refreshing…' : relativeTime(ws.refreshedAt, now)}</span>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Refresh updates"
            data-spinning={refreshing_ || undefined}
            onClick={() => actions.refreshWorkspace(ws.id)}
          >
            <Icon svg={refreshIcon} size={14} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Close updates" onClick={() => actions.setUpdatesOpen(false)}>
            <Icon svg={sideMenuCloseIcon} size={16} />
          </button>
        </div>
      </header>

      <div className={`${styles.list} thin-scroll`}>
        {widgets.map((w) => (
          <WidgetCard key={w.id} widget={w} wsId={ws.id} wsName={ws.name} size={{ w: 1, h: 2 }} variant="feed" now={now} />
        ))}

        {inChat ? (
          <button type="button" className={styles.addSlot} onClick={actions.goHome}>
            <ToolLogo kind="more" size={24} />
            <span className={styles.addSlotText}>
              <span className={styles.addSlotTitle}>{widgets.length ? `Add to ${ws.name.toLowerCase()}` : `Set up ${ws.name}`}</span>
              <span className={styles.addSlotSub}>{widgets.length ? 'More views of your tools' : 'Connect a tool and its updates show up here'}</span>
            </span>
          </button>
        ) : (
          !widgets.length && (
            <div className={styles.addSlot} data-static>
              <ToolLogo kind="more" size={24} />
              <span className={styles.addSlotText}>
                <span className={styles.addSlotTitle}>Nothing here yet</span>
                <span className={styles.addSlotSub}>Connect a tool on {ws.name} and its updates show up here</span>
              </span>
            </div>
          )
        )}
      </div>

      {widgets.length > 0 && (
        <footer className={styles.footer}>
          <button type="button" className={`${ui.btn} ${ui.btnInvert} ${styles.addAll}`} onClick={addAll}>
            <Icon svg={inChat ? addSmallIcon : sparkleBrandIcon} size={14} />
            {inChat ? 'Add these updates to this chat' : 'Ask Wisp about these updates'}
          </button>
          <p className={styles.footNote}>
            {inChat ? 'Wisp reads them as context for this conversation.' : 'Starts a chat with these updates as context.'}
          </p>
        </footer>
      )}
    </aside>
  )
}
