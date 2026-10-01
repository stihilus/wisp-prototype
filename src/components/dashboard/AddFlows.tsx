import { useMemo, useState } from 'react'
import { Icon } from '../Icon'
import { Modal } from '../ui/Modal'
import { Popover } from '../ui/Popover'
import { ToolLogo } from './ToolLogo'
import { chevRightIcon, circleCheckedIcon, circleUncheckIcon, lockerIcon, searchIcon } from '../../assets/icons'
import {
  customMeta,
  customOrder,
  presets,
  telegramChats,
  toolOrder,
  tools,
  type ToolId,
  type WidgetKind,
  type Workspace,
} from '../../data/dashboard'
import { connectedElsewhere, connectedTools } from '../../store/prototype'
import ui from '../ui/controls.module.css'
import styles from './AddFlows.module.css'

/* --------------------------------------------- 04 · Add widget dropdown */

type AddWidgetMenuProps = {
  anchor: HTMLElement | null
  workspace: Workspace
  workspaces: Workspace[]
  onClose: () => void
  onPick: (kind: WidgetKind) => void
  onBrowseAll: () => void
  onRequest: () => void
}

export function AddWidgetMenu({ anchor, workspace, workspaces, onClose, onPick, onBrowseAll, onRequest }: AddWidgetMenuProps) {
  const here = connectedTools(workspace)
  const elsewhere = toolOrder
    .filter((t) => !here.has(t))
    .map((t) => ({ tool: t, from: connectedElsewhere(workspaces, workspace.id, t) }))
    .filter((r): r is { tool: ToolId; from: Workspace } => !!r.from)
  const fresh = toolOrder.filter((t) => !here.has(t))

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-end" offset={6} className={styles.addMenu}>
      <div className={styles.addMenuHead}>
        <h3 className={styles.addMenuTitle}>Add to {workspace.name}</h3>
        <p className={styles.addMenuSub}>Widgets you add here stay in {workspace.name}.</p>
      </div>

      {elsewhere.length > 0 && (
        <section className={styles.section}>
          <span className={`${ui.sectionLabel} ${styles.sectionLabel}`}>Already connected in another workspace</span>
          {elsewhere.map(({ tool, from }) => (
            <button key={tool} type="button" className={styles.menuRow} onClick={() => onPick(tool)}>
              <ToolLogo kind={tool} size={24} />
              <span className={styles.menuRowText}>
                <span className={styles.menuRowTitle}>{tools[tool].name}</span>
                <span className={styles.menuRowSub}>Connected in {from.name}</span>
              </span>
              <Icon svg={chevRightIcon} size={14} className={styles.chev} />
            </button>
          ))}
        </section>
      )}

      {fresh.length > 0 && (
        <section className={styles.section}>
          <span className={`${ui.sectionLabel} ${styles.sectionLabel}`}>Connect a new tool</span>
          <div className={styles.toolChips}>
            {fresh.map((tool) => (
              <button key={tool} type="button" className={styles.toolChip} onClick={() => onPick(tool)}>
                <ToolLogo kind={tool} size={18} />
                {tools[tool].short}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <span className={`${ui.sectionLabel} ${styles.sectionLabel}`}>Custom widgets</span>
        {customOrder.map((kind) => (
          <button key={kind} type="button" className={styles.menuRow} onClick={() => onPick(kind)}>
            <ToolLogo kind="custom" size={24} />
            <span className={styles.menuRowText}>
              <span className={styles.menuRowTitle}>{customMeta[kind].name}</span>
              <span className={styles.menuRowSub}>{presets[kind][0].desc.split(' — ')[0]}</span>
            </span>
            <Icon svg={chevRightIcon} size={14} className={styles.chev} />
          </button>
        ))}
      </section>

      <div className={styles.addMenuFooter}>
        <span>
          <span className={styles.muted}>Missing something?</span>{' '}
          <button type="button" className={ui.link} onClick={onRequest}>
            Request a widget
          </button>
        </span>
        <button type="button" className={styles.browseAll} onClick={onBrowseAll}>
          Browse all views
          <Icon svg={chevRightIcon} size={12} />
        </button>
      </div>
    </Popover>
  )
}

/* ------------------------------------------- 05 · reuse or connect new */

type ReuseModalProps = {
  tool: ToolId
  workspace: Workspace
  from: Workspace
  onClose: () => void
  onContinue: (source: 'shared' | 'own') => void
}

export function ReuseModal({ tool, workspace, from, onClose, onContinue }: ReuseModalProps) {
  const [choice, setChoice] = useState<'shared' | 'own'>('shared')
  const meta = tools[tool]
  const scoped = !!meta.scope
  const unit = meta.scope?.unit === 'emails' ? 'labels' : 'chats'

  const options = [
    {
      id: 'shared' as const,
      title: `Use the account from ${from.name}`,
      desc: scoped
        ? `${meta.account} — you’ll pick which ${unit} ${workspace.name} can see. ${from.name} keeps its own list.`
        : `${meta.account} — ${workspace.name} gets its own widgets. ${from.name} keeps its own.`,
    },
    {
      id: 'own' as const,
      title: `Connect another ${meta.name} account`,
      desc:
        tool === 'telegram'
          ? 'For a separate work number. Takes about a minute.'
          : tool === 'gmail'
            ? 'For a separate work inbox. Takes about a minute.'
            : 'Sign in with a different account. Takes about a minute.',
    },
  ]

  return (
    <Modal onClose={onClose} width={520} label={`Add ${meta.name} to ${workspace.name}`}>
      <div className={styles.reuse}>
        <div className={styles.reuseHead}>
          <div className={styles.reuseTitleRow}>
            <ToolLogo kind={tool} size={28} />
            <h2 className={styles.reuseTitle}>
              Add {meta.name} to {workspace.name}
            </h2>
          </div>
          <p className={styles.reuseSub}>
            {workspace.name} is its own space. Choose where its {meta.name} comes from.
          </p>
        </div>

        <div className={styles.options} role="radiogroup">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={choice === o.id}
              className={styles.option}
              data-selected={choice === o.id}
              onClick={() => setChoice(o.id)}
              onDoubleClick={() => onContinue(o.id)}
            >
              <span className={styles.optionIcon}>
                <Icon svg={choice === o.id ? circleCheckedIcon : circleUncheckIcon} size={18} />
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{o.title}</span>
                <span className={styles.optionDesc}>{o.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <p className={styles.lockNote}>
          <Icon svg={lockerIcon} size={12} />
          Each workspace only sees what you give it.
        </p>

        <div className={styles.actions}>
          <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnInvert}`} onClick={() => onContinue(choice)}>
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------- 06 · choose chats */

type ScopeModalProps = {
  tool: ToolId
  workspace: Workspace
  /** where the account comes from — shapes the subtitle */
  sourceName?: string
  initial?: string[]
  confirmLabel: string
  onClose: () => void
  onConfirm: (scope: string[]) => void
}

export function ScopeModal({ tool, workspace, sourceName, initial, confirmLabel, onClose, onConfirm }: ScopeModalProps) {
  const scope = tools[tool].scope!
  const defaults = tool === 'telegram' ? ['work', 'lido'] : ['primary', 'work']
  const [selected, setSelected] = useState<string[]>(initial ?? defaults)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const folders = scope.folders.filter((f) => !q || f.name.toLowerCase().includes(q))
  const chats = useMemo(
    () => (tool === 'telegram' && q ? telegramChats.filter((c) => c.name.toLowerCase().includes(q)) : []),
    [q, tool],
  )

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const folderCount = selected.filter((id) => !id.startsWith('chat:')).length
  const chatCount = selected.filter((id) => id.startsWith('chat:')).length
  const total =
    scope.folders.filter((f) => selected.includes(f.id)).reduce((sum, f) => sum + f.count, 0) + chatCount
  const noun = scope.noun === 'labels' ? 'label' : 'folder'
  const parts = [
    folderCount ? `${folderCount} ${noun}${folderCount === 1 ? '' : 's'}` : null,
    `${total.toLocaleString('en-US')} ${scope.unit}`,
    tool === 'telegram' ? 'read on this Mac' : 'read-only',
  ].filter(Boolean)

  return (
    <Modal onClose={onClose} width={380} label={`Which ${scope.unit} can ${workspace.name} see?`}>
      <div className={styles.scope}>
        <div className={styles.scopeHead}>
          <h2 className={styles.scopeTitle}>
            Which {scope.unit} can {workspace.name} see?
          </h2>
          <p className={styles.scopeSub}>
            {sourceName
              ? `From the ${tools[tool].name} account you use in ${sourceName}. ${sourceName} keeps its own list.`
              : `From your ${tools[tool].name} account. Changes show up on the next refresh.`}
          </p>
        </div>

        <label className={styles.search}>
          <Icon svg={searchIcon} size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tool === 'telegram' ? 'Or search for a single chat' : 'Search labels'}
          />
        </label>

        <div className={styles.scopeList}>
          {folders.map((f) => {
            const on = selected.includes(f.id)
            return (
              <button key={f.id} type="button" className={styles.scopeRow} data-on={on} onClick={() => toggle(f.id)}>
                <Icon svg={on ? circleCheckedIcon : circleUncheckIcon} size={16} className={styles.scopeCheck} />
                <span className={styles.scopeName}>{f.name}</span>
                <span className={styles.scopeCount}>
                  {f.count.toLocaleString('en-US')} {scope.unit}
                </span>
              </button>
            )
          })}
          {chats.map((c) => {
            const id = `chat:${c.id}`
            const on = selected.includes(id)
            return (
              <button key={id} type="button" className={styles.scopeRow} data-on={on} onClick={() => toggle(id)}>
                <Icon svg={on ? circleCheckedIcon : circleUncheckIcon} size={16} className={styles.scopeCheck} />
                <span
                  className={styles.scopeAvatar}
                  style={{ background: `linear-gradient(180deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                >
                  {c.initials}
                </span>
                <span className={styles.scopeName}>{c.name}</span>
                <span className={styles.scopeCount}>single chat</span>
              </button>
            )
          })}
          {!folders.length && !chats.length && <p className={styles.scopeEmpty}>Nothing matches “{query}”.</p>}
        </div>

        <p className={styles.lockNote}>
          <Icon svg={lockerIcon} size={12} />
          {parts.join(' · ')}
        </p>

        <div className={styles.actions}>
          <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnInvert}`} onClick={() => onConfirm(selected)} disabled={!selected.length}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
