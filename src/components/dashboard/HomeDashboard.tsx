import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { Icon } from '../Icon'
import { TrustBar } from '../TrustBar'
import { Popover } from '../ui/Popover'
import { ToolLogo } from './ToolLogo'
import { WidgetGrid } from './WidgetGrid'
import { WidgetCard } from './WidgetCard'
import { PlaceholderCard } from './PlaceholderCard'
import { AddWidgetMenu, AddWidgetModal, ReuseModal, ScopeModal } from './AddFlows'
import { AutoRefreshPopover } from './WidgetPopovers'
import { WorkspaceNameForm } from './WorkspaceNameForm'
import { addSmallIcon, chevSmallIcon, closeSmallIcon, dotsV2Icon, refreshIcon, sparkleBrandIcon } from '../../assets/icons'
import {
  GRID_COLS,
  MAX_ROWS_PER_WIDGET,
  customMeta,
  isTool,
  kindName,
  placeholderMeta,
  relativeTime,
  tintColors,
  toolOrder,
  tools,
  type Placeholder,
  type ToolId,
  type Widget,
  type WidgetKind,
  type Workspace,
} from '../../data/dashboard'
import { compact } from '../../lib/gridLayout'
import { connectedElsewhere, connectedTools, usePrototype } from '../../store/prototype'
import ui from '../ui/controls.module.css'
import styles from './HomeDashboard.module.css'

const GAP = 16

type Flow =
  | { type: 'menu' }
  | { type: 'modal' }
  | { type: 'reuse'; tool: ToolId; from: Workspace; preset?: string; at?: { x: number; y: number } }
  | {
      type: 'scope'
      tool: ToolId
      source: 'shared' | 'own'
      from?: Workspace
      preset?: string
      at?: { x: number; y: number }
      widgetId?: string
      initial?: string[]
    }
  | null

type HeaderPanel = 'filter' | 'wsMenu' | 'autoRefresh' | 'newWs' | 'rename' | null

function useNow(interval = 20000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), interval)
    return () => window.clearInterval(t)
  }, [interval])
  return now
}

/** Rows fill the first screen (3 rows at 982px tall, like the Figma frame). */
function useRowHeight(ref: RefObject<HTMLElement | null>) {
  const [rowHeight, setRowHeight] = useState(250)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const h = el.clientHeight
      setRowHeight(Math.max(190, Math.min(260, Math.round((h - 193) / 3))))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return rowHeight
}

export function HomeDashboard() {
  const { state, activeWorkspace: ws, actions, connecting, freshIds, refreshing } = usePrototype()
  const scrollRef = useRef<HTMLDivElement>(null)
  const addRef = useRef<HTMLButtonElement>(null)
  const filterRef = useRef<HTMLButtonElement>(null)
  const dotsRef = useRef<HTMLButtonElement>(null)
  const newWsRef = useRef<HTMLButtonElement>(null)
  const [flow, setFlow] = useState<Flow>(null)
  const [panel, setPanel] = useState<HeaderPanel>(null)
  const [filter, setFilter] = useState<Record<string, WidgetKind | 'all'>>({})
  const rowHeight = useRowHeight(scrollRef)
  const now = useNow()

  const here = connectedTools(ws)
  const activeFilter = filter[ws.id] ?? 'all'
  const filtered = activeFilter !== 'all'
  const visibleWidgets = filtered ? compact(ws.widgets.filter((w) => w.kind === activeFilter)) : ws.widgets
  const hasWidgets = ws.widgets.length > 0

  // reset scroll when switching workspaces
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [ws.id])

  /* ------------------------------------------------------------ adding */

  const startAdd = (kind: WidgetKind, opts: { preset?: string; at?: { x: number; y: number } } = {}) => {
    if (!isTool(kind)) {
      actions.addWidget(ws.id, kind, { preset: opts.preset, at: opts.at })
      return
    }
    if (here.has(kind)) {
      actions.addWidget(ws.id, kind, { preset: opts.preset, at: opts.at })
      return
    }
    const from = connectedElsewhere(state.workspaces, ws.id, kind)
    if (from) {
      setFlow({ type: 'reuse', tool: kind, from, preset: opts.preset, at: opts.at })
      return
    }
    actions.connectTool(ws.id, kind, { preset: opts.preset, at: opts.at })
  }

  const onReuseContinue = (source: 'shared' | 'own') => {
    if (!flow || flow.type !== 'reuse') return
    const { tool, from, preset, at } = flow
    if (tools[tool].scope) {
      setFlow({ type: 'scope', tool, source, from: source === 'shared' ? from : undefined, preset, at })
      return
    }
    setFlow(null)
    if (source === 'shared') {
      actions.addWidget(ws.id, tool, { preset, at, silent: true })
      actions.toast(`${tools[tool].name} from ${from.name} added to ${ws.name}`)
    } else {
      actions.connectTool(ws.id, tool, { preset, at })
    }
  }

  const onScopeConfirm = (scope: string[]) => {
    if (!flow || flow.type !== 'scope') return
    const { tool, source, from, preset, at, widgetId } = flow
    setFlow(null)
    if (widgetId) {
      actions.updateWidget(ws.id, widgetId, { scope })
      actions.refreshWidget(ws.id, widgetId)
      actions.toast(`${ws.name} now sees ${scope.length} ${tool === 'telegram' ? 'folders & chats' : 'labels'} from ${tools[tool].name}`)
      return
    }
    if (source === 'shared') {
      actions.addWidget(ws.id, tool, { preset, at, scope, silent: true })
      actions.toast(`${tools[tool].name} added to ${ws.name} — ${from?.name ?? 'Home'} keeps its own list`)
    } else {
      actions.connectTool(ws.id, tool, { preset, at, scope })
    }
  }

  const openAdd = () => {
    const elsewhere = toolOrder.some((t) => !here.has(t) && connectedElsewhere(state.workspaces, ws.id, t))
    setFlow(elsewhere ? { type: 'menu' } : { type: 'modal' })
  }

  const request = (what: 'connector' | 'widget') =>
    actions.toast(what === 'connector' ? 'Connector request sent — we’ll ping you when it ships' : 'Widget request sent — thanks, this shapes what we build next')

  /* -------------------------------------------------------------- strip */

  const stripTools = toolOrder.filter((t) => !here.has(t)).slice(0, 5)

  /* ------------------------------------------------------------- render */

  const refreshingWs = !!refreshing[ws.id]

  return (
    <div className={`${styles.scroll} thin-scroll`} ref={scrollRef} data-scroll-root>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div className={styles.tabs} role="tablist" aria-label="Workspaces">
            {state.workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                role="tab"
                aria-selected={w.id === ws.id}
                className={styles.tab}
                onClick={() => actions.selectWorkspace(w.id)}
                onDoubleClick={() => {
                  actions.selectWorkspace(w.id)
                  setPanel('rename')
                }}
              >
                <span className={styles.letter} style={{ background: tintColors[w.tint] }}>
                  {w.letter}
                </span>
                <span className={styles.tabLabel}>{w.name}</span>
              </button>
            ))}
            <button
              ref={newWsRef}
              type="button"
              className={styles.newTab}
              aria-label="New workspace"
              title="New workspace"
              onClick={() => setPanel(panel === 'newWs' ? null : 'newWs')}
            >
              <Icon svg={addSmallIcon} size={14} />
            </button>
          </div>

          <div className={styles.controls}>
            {hasWidgets && (
              <button
                ref={filterRef}
                type="button"
                className={styles.filterButton}
                data-active={filtered || undefined}
                onClick={() => setPanel(panel === 'filter' ? null : 'filter')}
              >
                {filtered ? kindName(activeFilter as WidgetKind) : 'All tools'}
                <Icon svg={chevSmallIcon} size={12} />
              </button>
            )}
            {!hasWidgets && (
              <span className={styles.filterButton} data-disabled>
                All tools
                <Icon svg={chevSmallIcon} size={12} />
              </span>
            )}
            <span className={styles.updated}>{refreshingWs ? 'Refreshing…' : relativeTime(ws.refreshedAt, now)}</span>
            <button
              type="button"
              className={styles.smallIcon}
              aria-label="Refresh all widgets"
              data-spinning={refreshingWs || undefined}
              onClick={() => actions.refreshWorkspace(ws.id)}
            >
              <Icon svg={refreshIcon} size={14} />
            </button>
            <button
              ref={dotsRef}
              type="button"
              className={styles.smallIcon}
              aria-label="Workspace options"
              aria-expanded={panel === 'wsMenu'}
              onClick={() => setPanel(panel === 'wsMenu' ? null : 'wsMenu')}
            >
              <Icon svg={dotsV2Icon} size={14} />
            </button>
            <button ref={addRef} type="button" className={`${ui.btn} ${ui.btnBrand} ${styles.addButton}`} onClick={openAdd}>
              Add Widget
            </button>
          </div>
        </div>

        {filtered && (
          <div className={styles.filterNote}>
            Showing {kindName(activeFilter as WidgetKind)} only · moving and resizing is paused.{' '}
            <button type="button" className={ui.link} onClick={() => setFilter((f) => ({ ...f, [ws.id]: 'all' }))}>
              Show all tools
            </button>
          </div>
        )}

        <div className={styles.gridArea} key={ws.id}>
          {hasWidgets ? (
            <WidgetGrid<Widget>
              items={visibleWidgets}
              cols={GRID_COLS}
              rowHeight={rowHeight}
              gap={GAP}
              maxRows={MAX_ROWS_PER_WIDGET}
              disabled={filtered}
              freshIds={freshIds}
              onChange={(layout) => actions.setWidgetLayout(ws.id, layout)}
              renderItem={(widget, ctx) => (
                <WidgetCard
                  widget={widget}
                  wsId={ws.id}
                  wsName={ws.name}
                  size={ctx}
                  now={now}
                  onChooseScope={(w) =>
                    setFlow({
                      type: 'scope',
                      tool: w.kind as ToolId,
                      source: 'shared',
                      widgetId: w.id,
                      // no scope yet = it reads everything except the noisy buckets
                      initial:
                        w.scope ??
                        tools[w.kind as ToolId].scope!.folders
                          .filter((f) => !['channels', 'archived', 'receipts', 'newsletters'].includes(f.id))
                          .map((f) => f.id),
                    })
                  }
                />
              )}
            />
          ) : ws.placeholders.length ? (
            <WidgetGrid<Placeholder>
              items={ws.placeholders}
              cols={GRID_COLS}
              rowHeight={rowHeight}
              gap={GAP}
              maxRows={MAX_ROWS_PER_WIDGET}
              onChange={(layout) => actions.setPlaceholderLayout(ws.id, layout)}
              renderItem={(p, ctx) => {
                const meta = placeholderMeta[p.id]
                const kind: WidgetKind | undefined = meta.connects ?? (p.id === 'custom' ? 'chart' : undefined)
                return (
                  <PlaceholderCard
                    placeholder={p}
                    size={ctx}
                    connecting={!!(kind && connecting[`${ws.id}:${kind}`])}
                    onConnect={() => {
                      if (p.id === 'custom') actions.connectTool(ws.id, 'chart', { at: { x: p.x, y: p.y } })
                      else if (meta.connects) startAdd(meta.connects, { at: { x: p.x, y: p.y } })
                    }}
                    onBrowse={() => setFlow({ type: 'modal' })}
                    onHide={() => actions.hidePlaceholder(ws.id, p.id)}
                    onRequest={() => request(p.id === 'custom' ? 'widget' : 'connector')}
                  />
                )
              }}
            />
          ) : (
            <div className={styles.blank}>
              <ToolLogo kind="custom" size={32} />
              <h3 className={styles.blankTitle}>{ws.name} is empty</h3>
              <p className={styles.blankSub}>Add a widget for the tools you use here — or bring the suggestions back.</p>
              <div className={styles.blankActions}>
                <button type="button" className={`${ui.btn} ${ui.btnInvert}`} onClick={openAdd}>
                  Add a widget
                </button>
                <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={() => actions.resetLayout(ws.id)}>
                  Show suggestions
                </button>
              </div>
            </div>
          )}
        </div>

        {hasWidgets && !filtered && stripTools.length > 0 && (
          <section className={styles.strip}>
            <div className={styles.stripHead}>
              <span className={styles.stripTitle}>Add more to {ws.name}</span>
              <button type="button" className={ui.link} onClick={() => request('connector')}>
                Request a connector
              </button>
            </div>
            <div className={styles.stripItems}>
              {stripTools.map((tool) => {
                const busy = !!connecting[`${ws.id}:${tool}`]
                const from = connectedElsewhere(state.workspaces, ws.id, tool)
                return (
                  <button key={tool} type="button" className={styles.stripItem} onClick={() => startAdd(tool)} disabled={busy}>
                    <ToolLogo kind={tool} size={24} />
                    <span className={styles.stripText}>
                      <span className={styles.stripName}>{tools[tool].name}</span>
                      <span className={styles.stripBlurb}>{busy ? 'Connecting…' : from ? `Connected in ${from.name}` : tools[tool].blurb}</span>
                    </span>
                    {busy ? <span className={`${ui.spinner} ${styles.stripSpinner}`} /> : <Icon svg={addSmallIcon} size={14} className={styles.stripPlus} />}
                  </button>
                )
              })}
              <button type="button" className={styles.stripItem} onClick={() => setFlow({ type: 'modal' })}>
                <ToolLogo kind="custom" size={24} />
                <span className={styles.stripText}>
                  <span className={styles.stripName}>Custom widget</span>
                  <span className={styles.stripBlurb}>Charts and summaries</span>
                </span>
                <Icon svg={addSmallIcon} size={14} className={styles.stripPlus} />
              </button>
            </div>
          </section>
        )}

        <div className={styles.trust}>
          <TrustBar />
        </div>
      </div>

      {/* ----------------------------------------------- header popovers */}

      {panel === 'newWs' && (
        <Popover anchor={newWsRef.current} onClose={() => setPanel(null)} placement="bottom-start" offset={8} className={styles.namePopover}>
          <div className={styles.namePopoverBody}>
            <div>
              <h3 className={styles.popTitle}>New workspace</h3>
              <p className={styles.popSub}>Its own widgets, and it only sees what you give it.</p>
            </div>
            <WorkspaceNameForm
              initial=""
              cta="Create"
              onCancel={() => setPanel(null)}
              onSubmit={(name) => {
                setPanel(null)
                actions.createWorkspace(name)
              }}
            />
          </div>
        </Popover>
      )}

      {panel === 'rename' && (
        <Popover anchor={dotsRef.current} onClose={() => setPanel(null)} placement="bottom-end" offset={8} className={styles.namePopover}>
          <div className={styles.namePopoverBody}>
            <h3 className={styles.popTitle}>Rename workspace</h3>
            <WorkspaceNameForm
              initial={ws.name}
              cta="Save"
              onCancel={() => setPanel(null)}
              onSubmit={(name) => {
                setPanel(null)
                actions.renameWorkspace(ws.id, name)
              }}
            />
          </div>
        </Popover>
      )}

      {panel === 'filter' && (
        <Popover anchor={filterRef.current} onClose={() => setPanel(null)} placement="bottom-end" offset={6}>
          <div className={ui.menu} style={{ minWidth: 200 }}>
            <button
              type="button"
              className={ui.menuItem}
              onClick={() => {
                setFilter((f) => ({ ...f, [ws.id]: 'all' }))
                setPanel(null)
              }}
            >
              <span className={ui.menuLabel}>All tools</span>
              {!filtered && <span className={ui.menuHint}>✓</span>}
            </button>
            <div className={ui.menuDivider} />
            {Array.from(new Set(ws.widgets.map((w) => w.kind))).map((kind) => (
              <button
                key={kind}
                type="button"
                className={ui.menuItem}
                onClick={() => {
                  setFilter((f) => ({ ...f, [ws.id]: kind }))
                  setPanel(null)
                }}
              >
                <ToolLogo kind={isTool(kind) ? kind : 'custom'} size={18} />
                <span className={ui.menuLabel}>{isTool(kind) ? tools[kind].name : customMeta[kind].name}</span>
                {activeFilter === kind && <span className={ui.menuHint}>✓</span>}
              </button>
            ))}
          </div>
        </Popover>
      )}

      {panel === 'wsMenu' && (
        <Popover anchor={dotsRef.current} onClose={() => setPanel(null)} placement="bottom-end" offset={8}>
          <div className={ui.menu} style={{ minWidth: 260 }}>
            <button type="button" className={ui.menuItem} onClick={() => setPanel('autoRefresh')}>
              <Icon svg={refreshIcon} size={14} />
              <span className={ui.menuLabel}>Auto-refresh every 30 min</span>
              <span className={ui.badgeBrand}>Starter</span>
            </button>
            <button
              type="button"
              className={ui.menuItem}
              onClick={() => {
                setPanel(null)
                actions.resetLayout(ws.id)
              }}
            >
              <Icon svg={sparkleBrandIcon} size={14} />
              <span className={ui.menuLabel}>{hasWidgets ? 'Tidy up layout' : 'Bring back suggestions'}</span>
            </button>
            <button type="button" className={ui.menuItem} onClick={() => setPanel('rename')}>
              <span className={styles.menuLetter} style={{ background: tintColors[ws.tint] }}>
                {ws.letter}
              </span>
              <span className={ui.menuLabel}>Rename “{ws.name}”…</span>
            </button>
            {(hasWidgets || state.workspaces.length > 1) && <div className={ui.menuDivider} />}
            {hasWidgets && (
              <button
                type="button"
                className={`${ui.menuItem} ${ui.menuItemDanger}`}
                onClick={() => {
                  setPanel(null)
                  actions.removeAllWidgets(ws.id)
                }}
              >
                <Icon svg={closeSmallIcon} size={14} />
                <span className={ui.menuLabel}>Remove all widgets</span>
              </button>
            )}
            {state.workspaces.length > 1 && ws.id !== 'home' && (
              <button
                type="button"
                className={`${ui.menuItem} ${ui.menuItemDanger}`}
                onClick={() => {
                  setPanel(null)
                  actions.deleteWorkspace(ws.id)
                }}
              >
                <Icon svg={closeSmallIcon} size={14} />
                <span className={ui.menuLabel}>Delete workspace</span>
              </button>
            )}
          </div>
        </Popover>
      )}

      {panel === 'autoRefresh' && (
        <AutoRefreshPopover
          anchor={dotsRef.current}
          onClose={() => setPanel(null)}
          onSeePlans={() => {
            setPanel(null)
            actions.toast('Plans live in Settings → Billing (not part of this prototype)')
          }}
        />
      )}

      {/* ---------------------------------------------------- add flows */}

      {flow?.type === 'menu' && (
        <AddWidgetMenu
          anchor={addRef.current}
          workspace={ws}
          workspaces={state.workspaces}
          onClose={() => setFlow(null)}
          onPick={(kind) => {
            setFlow(null)
            startAdd(kind)
          }}
          onBrowseAll={() => setFlow({ type: 'modal' })}
          onRequest={() => {
            setFlow(null)
            request('widget')
          }}
        />
      )}

      {flow?.type === 'modal' && (
        <AddWidgetModal
          workspace={ws}
          workspaces={state.workspaces}
          connecting={connecting}
          onClose={() => setFlow(null)}
          onAdd={(kind, preset) => {
            if (isTool(kind) && !here.has(kind) && connectedElsewhere(state.workspaces, ws.id, kind)) {
              startAdd(kind, { preset })
              return
            }
            startAdd(kind, { preset })
          }}
          onRequest={request}
        />
      )}

      {flow?.type === 'reuse' && (
        <ReuseModal tool={flow.tool} workspace={ws} from={flow.from} onClose={() => setFlow(null)} onContinue={onReuseContinue} />
      )}

      {flow?.type === 'scope' && (
        <ScopeModal
          tool={flow.tool}
          workspace={ws}
          sourceName={flow.from?.name}
          initial={flow.initial}
          confirmLabel={flow.widgetId ? 'Save' : 'Add widget'}
          onClose={() => setFlow(null)}
          onConfirm={onScopeConfirm}
        />
      )}
    </div>
  )
}
