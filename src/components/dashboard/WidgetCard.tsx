import { useRef, useState } from 'react'
import { Icon } from '../Icon'
import { Popover } from '../ui/Popover'
import { ToolLogo } from './ToolLogo'
import { WidgetBody, bodyHasOwnHeading, type BodyVariant } from './WidgetBody'
import { AutoRefreshPopover, ChangeWidgetPopover, WidgetMenu } from './WidgetPopovers'
import {
  arrowRightIcon,
  chevSmallIcon,
  dotsV2Icon,
  gripIcon,
  lockerIcon,
  refreshIcon,
  resizeHandleIcon,
} from '../../assets/icons'
import { isTool, kindName, presetFor, relativeTime, widgetContent, type Widget, type WidgetKind } from '../../data/dashboard'
import { usePrototype } from '../../store/prototype'
import ui from '../ui/controls.module.css'
import styles from './WidgetCard.module.css'

type WidgetCardProps = {
  widget: Widget
  wsId: string
  wsName: string
  size: { w: number; h: number }
  variant?: BodyVariant
  now?: number
  onChooseScope?: (widget: Widget) => void
}

type Panel = 'menu' | 'change' | 'refresh' | 'range' | null

const ranges = ['Last 7 days', 'Last 30 days', 'Last 90 days']

function headerName(widget: Widget, source: WidgetKind) {
  if (widget.kind === 'summary') return 'Summary'
  if (widget.kind === 'topic') return 'Topic'
  return kindName(source)
}

export function WidgetCard({ widget, wsId, wsName, size, variant = 'grid', now = Date.now(), onChooseScope }: WidgetCardProps) {
  const { state, actions, refreshing } = usePrototype()
  const [panel, setPanel] = useState<Panel>(null)
  const [range, setRange] = useState('Last 30 days')
  const menuRef = useRef<HTMLButtonElement>(null)
  const rangeRef = useRef<HTMLButtonElement>(null)

  const content = widgetContent(widget)
  const source = content.source ?? widget.kind
  const custom = !isTool(widget.kind)
  const isRefreshing = !!refreshing[widget.id]
  const ownHeading = bodyHasOwnHeading(content.body)
  const feed = variant === 'feed'
  // in the Updates panel next to a chat, rows go into that chat; on Home they start one
  const addsToChat = feed && state.view === 'chat'

  const ask = () => actions.askWisp(widget)

  const onRowAction = (label: string, detail: string) => {
    if (addsToChat) {
      actions.addContext(
        [widget.kind],
        `${kindName(widget.kind)} · ${label}`,
        detail,
        `Added ${label} to this chat. Latest: “${detail}” — want me to draft a reply or pull in more context?`,
      )
      return
    }
    actions.askWisp(
      widget,
      `What’s going on in ${label}?`,
      `Here’s the latest from ${label}: ${detail}\n\nNothing else in there needs you right now. Want me to draft a reply?`,
    )
  }

  return (
    <article className={styles.card} data-variant={variant} data-refreshing={isRefreshing || undefined} data-open={panel !== null || undefined}>
      <header className={styles.header} data-drag-handle={feed ? undefined : true}>
        {!feed && (
          <span className={styles.grip} title="Drag to move">
            <Icon svg={gripIcon} size={14} />
          </span>
        )}
        <ToolLogo kind={widget.kind === 'summary' || widget.kind === 'topic' ? 'custom' : source} size={24} />
        <span className={styles.name}>
          {headerName(widget, source)}
          {widget.kind === 'posthog' && <span className={styles.nameSuffix}> · usewisp.io</span>}
        </span>
        <span className={styles.spacer} />

        {!feed && widget.kind === 'posthog' && widget.preset === 'traffic' && size.w >= 2 && (
          <button ref={rangeRef} type="button" className={styles.rangeButton} onClick={() => setPanel(panel === 'range' ? null : 'range')}>
            {range}
            <Icon svg={chevSmallIcon} size={12} />
          </button>
        )}
        {!feed && widget.kind === 'health' && (
          <span className={styles.privateBadge}>
            <Icon svg={lockerIcon} size={12} />
            Private
          </span>
        )}
        {!feed && custom && <span className={ui.badgeBrand}>Custom</span>}

        {feed ? (
          <>
            <span className={styles.updated}>{relativeTime(widget.updatedAt ?? now - 2 * 3600 * 1000, now)}</span>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Refresh"
              data-spinning={isRefreshing || undefined}
              onClick={() => actions.refreshWidget(wsId, widget.id)}
            >
              <Icon svg={refreshIcon} size={14} />
            </button>
          </>
        ) : (
          <button
            ref={menuRef}
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            aria-label="Widget options"
            aria-expanded={panel === 'menu'}
            onClick={() => setPanel(panel === 'menu' ? null : 'menu')}
          >
            <Icon svg={dotsV2Icon} size={14} />
          </button>
        )}
      </header>

      <div className={styles.content} key={`${widget.preset}-${widget.prompt ?? ''}-${widget.updatedAt ?? 0}`}>
        {!ownHeading && (
          <div className={styles.titleBlock}>
            <h3 className={styles.headline}>{content.headline}</h3>
            {content.sub && <p className={styles.sub}>{content.sub}</p>}
          </div>
        )}
        <WidgetBody
          widget={widget}
          content={content}
          size={size}
          variant={variant}
          rowActionLabel={addsToChat ? 'Add to this chat' : 'Ask Wisp'}
          onRowAction={onRowAction}
          onToggleTodo={(id) => {
            const done = widget.done ?? []
            actions.updateWidget(wsId, widget.id, { done: done.includes(id) ? done.filter((d) => d !== id) : [...done, id] })
          }}
        />
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.cta} onClick={ask} data-no-drag>
          {content.cta}
          <Icon svg={arrowRightIcon} size={12} />
        </button>
      </footer>

      {!feed && (
        <span className={styles.resizeGlyph} aria-hidden>
          <Icon svg={resizeHandleIcon} size={14} />
        </span>
      )}

      {panel === 'menu' && (
        <WidgetMenu
          anchor={menuRef.current}
          widget={widget}
          workspaceName={wsName}
          onClose={() => setPanel(null)}
          onRefresh={() => {
            setPanel(null)
            actions.refreshWidget(wsId, widget.id)
          }}
          onAutoRefresh={() => setPanel('refresh')}
          onChooseScope={
            onChooseScope
              ? () => {
                  setPanel(null)
                  onChooseScope(widget)
                }
              : undefined
          }
          onChange={() => setPanel('change')}
          onAsk={() => {
            setPanel(null)
            ask()
          }}
          onRemove={() => {
            setPanel(null)
            actions.removeWidget(wsId, widget.id)
          }}
        />
      )}

      {panel === 'change' && (
        <ChangeWidgetPopover
          anchor={menuRef.current}
          widget={widget}
          onClose={() => setPanel(null)}
          onSave={(preset, prompt) => {
            setPanel(null)
            const presetPrompt = presetFor(widget.kind, preset).prompt
            actions.updateWidget(wsId, widget.id, { preset, prompt: prompt?.trim() === presetPrompt ? undefined : prompt?.trim() })
            actions.refreshWidget(wsId, widget.id)
            actions.toast('Widget updated — Wisp will check it on every refresh')
          }}
        />
      )}

      {panel === 'refresh' && (
        <AutoRefreshPopover
          anchor={menuRef.current}
          onClose={() => setPanel(null)}
          onSeePlans={() => {
            setPanel(null)
            actions.toast('Plans live in Settings → Billing (not part of this prototype)')
          }}
        />
      )}

      {panel === 'range' && (
        <Popover anchor={rangeRef.current} onClose={() => setPanel(null)} placement="bottom-end" offset={6}>
          <div className={ui.menu} style={{ minWidth: 160 }}>
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                className={ui.menuItem}
                onClick={() => {
                  setRange(r)
                  setPanel(null)
                  actions.refreshWidget(wsId, widget.id)
                }}
              >
                <span className={ui.menuLabel}>{r}</span>
                {r === range && <span className={ui.menuHint}>✓</span>}
              </button>
            ))}
          </div>
        </Popover>
      )}
    </article>
  )
}
