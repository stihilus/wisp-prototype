import { useState } from 'react'
import { Icon } from '../Icon'
import { Modal } from '../ui/Modal'
import { ToolLogo } from './ToolLogo'
import { WidgetBody } from './WidgetBody'
import { checkIcon, chevRightIcon, closeIcon, searchIcon, sparkleBrandIcon } from '../../assets/icons'
import {
  customMeta,
  customOrder,
  isTool,
  presets,
  toolOrder,
  tools,
  widgetContent,
  type ToolId,
  type Widget,
  type WidgetKind,
  type Workspace,
} from '../../data/dashboard'
import { connectedElsewhere, connectedTools } from '../../store/prototype'
import ui from '../ui/controls.module.css'
import styles from './AddWidgetModal.module.css'

// "Add to …" — step 1 is a feed of preview cards (one per tool, plus Custom),
// step 2 opens one of them: suggested views and a box to describe your own.

type Group = ToolId | 'custom'
type Row = { kind: WidgetKind; preset: string; title: string; desc: string }

const groups: Group[] = [...toolOrder, 'custom']

const pitch: Record<Group, string> = {
  telegram: 'Catch up on the chats you skipped',
  gmail: 'See which emails need a reply',
  calendar: 'Know what’s next today',
  granola: 'Keep what you promised in meetings',
  linear: 'See how the team is moving',
  notion: 'Track what changed in your docs',
  drive: 'See what’s been shared with you',
  posthog: 'Watch traffic, downloads and sign-ups',
  health: 'Steps, sleep and heart rate at a glance',
  custom: 'Build your own from a prompt',
}

const promptExample: Record<Group, string> = {
  telegram: 'e.g. Messages in Lido core that mention a deadline',
  gmail: 'e.g. Invoices I haven’t paid yet',
  calendar: 'e.g. Client meetings this week',
  granola: 'e.g. Decisions from every design review',
  linear: 'e.g. Bugs customers reported this week',
  notion: 'e.g. Pages in Hiring that changed today',
  drive: 'e.g. Contracts shared with me this month',
  posthog: 'e.g. Sign-ups that came from /private-ai',
  health: 'e.g. How my sleep changes on gym days',
  custom: 'e.g. A weekly chart of Gmail invoices next to Linear issues closed',
}

function groupName(group: Group) {
  return group === 'custom' ? 'Custom widget' : tools[group].name
}

function rowsFor(group: Group): Row[] {
  if (group === 'custom') {
    return customOrder.map((k) => ({ kind: k, preset: presets[k][0].id, title: customMeta[k].name, desc: presets[k][0].desc }))
  }
  return presets[group].map((p) => ({ kind: group, preset: p.id, title: p.title, desc: p.desc }))
}

/** dimmed sample of what the widget looks like — same idea as the Home placeholders */
function Preview({ group }: { group: Group }) {
  const kind: WidgetKind = group === 'custom' ? 'chart' : group
  const widget: Widget = { id: `preview-${kind}`, kind, preset: presets[kind][0].id, x: 0, y: 0, w: 2, h: 1 }
  return (
    <div className={styles.preview} aria-hidden>
      <WidgetBody widget={widget} content={widgetContent(widget)} size={{ w: 2, h: 1 }} variant="grid" />
    </div>
  )
}

type Props = {
  workspace: Workspace
  workspaces: Workspace[]
  connecting: Record<string, boolean>
  onClose: () => void
  onAdd: (kind: WidgetKind, preset: string, prompt?: string) => void
  onRequest: () => void
}

export function AddWidgetModal({ workspace, workspaces, connecting, onClose, onAdd, onRequest }: Props) {
  const [group, setGroup] = useState<Group | null>(null)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const here = connectedTools(workspace)

  const isEnabled = (kind: WidgetKind, preset: string) =>
    workspace.widgets.some((w) => w.kind === kind && w.preset === preset && !w.prompt)

  const status = (g: Group): { label: string; on: boolean } | null => {
    if (g === 'custom') {
      const count = workspace.widgets.filter((w) => !isTool(w.kind)).length
      return count ? { label: `${count} enabled`, on: true } : null
    }
    if (here.has(g)) return { label: 'Enabled', on: true }
    const from = connectedElsewhere(workspaces, workspace.id, g)
    return { label: from ? `Connected in ${from.name}` : 'Not connected', on: false }
  }

  const q = query.trim().toLowerCase()
  const matchingRow = (g: Group) => (q ? rowsFor(g).find((r) => `${r.title} ${r.desc}`.toLowerCase().includes(q)) : undefined)
  const visible = groups.filter((g) => {
    if (!q) return true
    const text = `${groupName(g)} ${pitch[g]} ${g === 'custom' ? '' : tools[g].blurb}`.toLowerCase()
    return text.includes(q) || !!matchingRow(g)
  })

  const openGroup = (g: Group) => {
    setGroup(g)
    setDraft('')
  }

  const detailSub = (g: Group) => {
    if (g === 'custom') return 'Combine your tools into a chart, a digest or a topic to watch.'
    if (here.has(g)) return `Enabled in ${workspace.name}. Add another view or describe your own.`
    const from = connectedElsewhere(workspaces, workspace.id, g)
    if (from) return `Connected in ${from.name} — you’ll choose what ${workspace.name} can see.`
    return `Not connected yet. Adding a view connects ${tools[g].name} to ${workspace.name}.`
  }

  const customKind = (g: Group): WidgetKind => (g === 'custom' ? 'chart' : g)

  return (
    <Modal onClose={onClose} width={600} label={`Add to ${workspace.name}`} className={styles.modal}>
      <div className={styles.head}>
        {group ? (
          <div className={styles.headMain}>
            <button type="button" className={styles.back} onClick={() => setGroup(null)} aria-label="Back to all widgets">
              <Icon svg={chevRightIcon} size={14} />
            </button>
            <ToolLogo kind={group === 'custom' ? 'custom' : group} size={28} />
            <div className={styles.headText}>
              <h2 className={styles.title}>{groupName(group)}</h2>
              <p className={styles.sub}>{detailSub(group)}</p>
            </div>
          </div>
        ) : (
          <div className={styles.headText}>
            <h2 className={styles.title}>Add to {workspace.name}</h2>
            <p className={styles.sub}>Pick a tool to see suggested views, or describe your own. Everything here stays in {workspace.name}.</p>
          </div>
        )}
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <Icon svg={closeIcon} size={16} />
        </button>
      </div>

      {group === null ? (
        <div className={styles.view} key="feed">
          <div className={styles.searchWrap}>
            <label className={styles.search}>
              <Icon svg={searchIcon} size={14} />
              <input
                id="add-widget-search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools and widgets"
              />
            </label>
          </div>

          <div className={`${styles.feed} thin-scroll`}>
            {visible.map((g) => {
              const st = status(g)
              const match = matchingRow(g)
              const count = rowsFor(g).length
              return (
                <div
                  key={g}
                  role="button"
                  tabIndex={0}
                  className={styles.card}
                  onClick={() => openGroup(g)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openGroup(g)
                    }
                  }}
                >
                  <div className={styles.cardHead}>
                    <ToolLogo kind={g === 'custom' ? 'custom' : g} size={24} />
                    <span className={styles.cardName}>{groupName(g)}</span>
                    {st && (
                      <span className={styles.status} data-on={st.on}>
                        {st.on && <Icon svg={checkIcon} size={12} />}
                        {st.label}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{pitch[g]}</h3>
                  <Preview group={g} />
                  <div className={styles.cardFoot}>
                    <span>{match ? `Matches “${match.title}”` : `${count} suggested views · or describe your own`}</span>
                    <Icon svg={chevRightIcon} size={14} className={styles.cardChev} />
                  </div>
                </div>
              )
            })}

            {visible.length === 0 && (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>Nothing matches “{query}”</p>
                <p className={styles.emptySub}>Tell us what you’d like to see on {workspace.name}.</p>
                <button type="button" className={ui.link} onClick={onRequest}>
                  Request a widget
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`${styles.view} ${styles.detail} thin-scroll`} key={group}>
          <section className={styles.section}>
            <span className={ui.sectionLabel}>Suggested views</span>
            {rowsFor(group).map((row) => {
              const on = isEnabled(row.kind, row.preset)
              const busy = !!connecting[`${workspace.id}:${row.kind}`]
              return (
                <div key={`${row.kind}-${row.preset}`} className={styles.row}>
                  <div className={styles.rowText}>
                    <span className={styles.rowTitle}>{row.title}</span>
                    <span className={styles.rowDesc}>{row.desc}</span>
                  </div>
                  {on ? (
                    <span className={styles.enabled}>
                      <Icon svg={checkIcon} size={14} />
                      Enabled
                    </span>
                  ) : (
                    <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={() => onAdd(row.kind, row.preset)} disabled={busy}>
                      {busy && <span className={ui.spinner} />}
                      {busy ? 'Connecting…' : 'Add'}
                    </button>
                  )}
                </div>
              )
            })}
          </section>

          <section className={styles.section}>
            <span className={ui.sectionLabel}>Describe your own</span>
            <form
              className={styles.custom}
              onSubmit={(e) => {
                e.preventDefault()
                const text = draft.trim()
                if (!text) return
                const kind = customKind(group)
                onAdd(kind, presets[kind][0].id, text)
                setDraft('')
              }}
            >
              <textarea
                id={`add-widget-prompt-${group}`}
                className={styles.prompt}
                rows={3}
                value={draft}
                placeholder={promptExample[group]}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit()
                }}
              />
              <div className={styles.customFoot}>
                <span className={styles.hint}>
                  <Icon svg={sparkleBrandIcon} size={10} className={styles.brand} />
                  Wisp turns it into a widget and checks it on every refresh.
                </span>
                <button
                  type="submit"
                  className={`${ui.btn} ${ui.btnInvert}`}
                  disabled={!draft.trim() || !!connecting[`${workspace.id}:${customKind(group)}`]}
                >
                  Add to {workspace.name}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.muted}>Can’t find it?</span>
        <button type="button" className={ui.link} onClick={onRequest}>
          Request a widget
        </button>
      </div>
    </Modal>
  )
}
