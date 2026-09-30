import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { RowTooltip } from './RowTooltip'
import { Popover } from './ui/Popover'
import { WorkspaceNameForm } from './dashboard/WorkspaceNameForm'
import { useRowTooltip } from '../hooks/useRowTooltip'
import {
  addIcon,
  addSmallIcon,
  artifactsIcon,
  chatBubbleIcon,
  chatIcon,
  checkIcon,
  dashboardIcon,
  dotsV2Icon,
  downIcon,
  folderIcon,
  folderOpenIcon,
  memoryIcon,
  newChatIcon,
  profileIcon,
  settingsIcon,
} from '../assets/icons'
import { recentsHistory, starredHistory, type ChatEntry, type HistoryItem } from '../data/chatHistory'
import { tintColors, type Workspace } from '../data/dashboard'
import { usePrototype, type View } from '../store/prototype'
import ui from './ui/controls.module.css'
import styles from './LeftSideNav.module.css'

type LeftSideNavProps = {
  open: boolean
  view: View
  onHome: () => void
  onChat: () => void
  onNewChat: () => void
  onOpenChat: () => void
}

function ChatRow({ entry, onOpenChat, nested = false }: { entry: ChatEntry; onOpenChat: () => void; nested?: boolean }) {
  const tooltip = useRowTooltip<HTMLButtonElement>('right')

  return (
    <button
      ref={tooltip.ref}
      type="button"
      className={nested ? styles.nestedRow : styles.historyRow}
      onClick={onOpenChat}
      onMouseEnter={tooltip.onMouseEnter}
      onMouseLeave={tooltip.onMouseLeave}
    >
      {!nested && <Icon svg={chatIcon} className={styles.rowIcon} />}
      <span className={styles.rowLabel}>{entry.label}</span>
      <RowTooltip label={entry.label} pos={tooltip.pos} side={tooltip.side} />
    </button>
  )
}

function FolderGroup({
  folder,
  onOpenChat,
}: {
  folder: Extract<HistoryItem, { type: 'folder' }>
  onOpenChat: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const tooltip = useRowTooltip<HTMLDivElement>('right')

  return (
    <div className={styles.folderGroup}>
      <div
        ref={tooltip.ref}
        role="button"
        tabIndex={0}
        className={styles.historyRow}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
        onMouseEnter={tooltip.onMouseEnter}
        onMouseLeave={tooltip.onMouseLeave}
        aria-expanded={expanded}
      >
        <Icon svg={expanded ? folderOpenIcon : folderIcon} className={styles.rowIcon} />
        <span className={styles.rowLabel}>{folder.name}</span>
        <div className={styles.folderActions}>
          <button
            type="button"
            className={styles.folderActionButton}
            aria-label="New chat in project"
            onClick={(e) => {
              e.stopPropagation()
              onOpenChat()
            }}
          >
            <Icon svg={addIcon} size={14} />
          </button>
          <Icon
            svg={downIcon}
            size={14}
            className={expanded ? styles.folderChevron : `${styles.folderChevron} ${styles.folderChevronCollapsed}`}
          />
        </div>
        <RowTooltip label={folder.name} pos={tooltip.pos} side={tooltip.side} />
      </div>
      {expanded && (
        <div className={styles.nestedRows}>
          {folder.conversations.map((entry) => (
            <ChatRow key={entry.id} entry={entry} onOpenChat={onOpenChat} nested />
          ))}
        </div>
      )}
    </div>
  )
}

function HistorySection({
  title,
  items,
  onOpenChat,
}: {
  title: string
  items: HistoryItem[]
  onOpenChat: () => void
}) {
  return (
    <section className={styles.section}>
      <p className={styles.sectionTitle}>{title}</p>
      <div className={styles.rows}>
        {items.map((item) =>
          item.type === 'folder' ? (
            <FolderGroup key={item.id} folder={item} onOpenChat={onOpenChat} />
          ) : (
            <ChatRow key={item.id} entry={item} onOpenChat={onOpenChat} />
          ),
        )}
      </div>
    </section>
  )
}

function Letter({ ws, size = 28 }: { ws: Workspace; size?: number }) {
  return (
    <span
      className={styles.letter}
      style={{ background: tintColors[ws.tint], width: size, height: size, fontSize: size >= 28 ? 13 : 10, borderRadius: size >= 28 ? 8 : 6 }}
    >
      {ws.letter}
    </span>
  )
}

/** Switch / create workspaces — opened from the chip (collapsed) or ⋮ (open nav). */
function WorkspaceSwitcher({ anchor, onClose, startCreating = false }: { anchor: HTMLElement | null; onClose: () => void; startCreating?: boolean }) {
  const { state, actions } = usePrototype()
  const [creating, setCreating] = useState(startCreating)

  return (
    <Popover anchor={anchor} onClose={onClose} placement="right-end" offset={12} className={styles.switcher}>
      {creating ? (
        <div className={styles.switcherForm}>
          <div>
            <p className={styles.switcherTitle}>New workspace</p>
            <p className={styles.switcherSub}>Its own widgets, and it only sees what you give it.</p>
          </div>
          <WorkspaceNameForm
            cta="Create"
            onCancel={onClose}
            onSubmit={(name) => {
              onClose()
              actions.createWorkspace(name)
            }}
          />
        </div>
      ) : (
        <div className={ui.menu}>
          <span className={`${ui.sectionLabel} ${styles.switcherLabel}`}>Workspaces</span>
          {state.workspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              className={ui.menuItem}
              onClick={() => {
                onClose()
                actions.selectWorkspace(ws.id)
              }}
            >
              <Letter ws={ws} size={20} />
              <span className={ui.menuLabel}>{ws.name}</span>
              <span className={ui.menuHint}>{ws.widgets.length ? `${ws.widgets.length} widgets` : 'empty'}</span>
              {ws.id === state.activeWorkspaceId && <Icon svg={checkIcon} size={12} />}
            </button>
          ))}
          <div className={ui.menuDivider} />
          <button type="button" className={ui.menuItem} onClick={() => setCreating(true)}>
            <Icon svg={addSmallIcon} size={14} />
            <span className={ui.menuLabel}>New workspace…</span>
          </button>
        </div>
      )}
    </Popover>
  )
}

export function LeftSideNav({ open, view, onHome, onChat, onNewChat, onOpenChat }: LeftSideNavProps) {
  const { state, activeWorkspace, actions } = usePrototype()
  const [switcher, setSwitcher] = useState<'list' | 'create' | null>(null)
  const chipRef = useRef<HTMLButtonElement>(null)
  const dotsRef = useRef<HTMLButtonElement>(null)
  const plusRef = useRef<HTMLButtonElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  const openSwitcher = (el: HTMLElement | null, mode: 'list' | 'create') => {
    setAnchor(el)
    setSwitcher(switcher === mode && anchor === el ? null : mode)
  }

  const switcherPopover = switcher && (
    <WorkspaceSwitcher key={switcher} anchor={anchor} onClose={() => setSwitcher(null)} startCreating={switcher === 'create'} />
  )

  if (!open) {
    return (
      <aside className={styles.nav} data-open={open}>
        <div className={styles.collapsedInner}>
          <div className={styles.collapsedTop}>
            <button
              type="button"
              className={styles.railButton}
              data-active={view === 'home'}
              data-tooltip="Dashboard"
              aria-label="Dashboard"
              onClick={onHome}
            >
              <Icon svg={dashboardIcon} />
            </button>
            <button
              type="button"
              className={styles.railButton}
              data-active={view === 'chat'}
              data-tooltip="Chat"
              aria-label="Chat"
              onClick={onChat}
            >
              <Icon svg={chatBubbleIcon} />
            </button>
            <button type="button" className={styles.railButton} data-tooltip="Artifacts" aria-label="Artifacts">
              <Icon svg={artifactsIcon} />
            </button>
          </div>
          <div className={styles.collapsedBottom}>
            <button
              ref={chipRef}
              type="button"
              className={styles.wsChip}
              aria-label={`Workspace: ${activeWorkspace.name}`}
              data-tooltip={activeWorkspace.name}
              onClick={() => openSwitcher(chipRef.current, 'list')}
            >
              <Letter ws={activeWorkspace} />
            </button>
            <span className={styles.railDivider} />
            <button type="button" className={styles.iconButton} aria-label="Settings">
              <Icon svg={settingsIcon} />
            </button>
            <button type="button" className={styles.iconButton} aria-label="Memory">
              <Icon svg={memoryIcon} />
            </button>
            <button type="button" className={styles.iconButton} aria-label="Profile">
              <Icon svg={profileIcon} />
            </button>
          </div>
        </div>
        {switcherPopover}
      </aside>
    )
  }

  return (
    <aside className={styles.nav} data-open={open}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <button type="button" className={styles.primaryRow} data-active={view === 'home'} onClick={onHome}>
            <Icon svg={dashboardIcon} className={styles.rowIcon} />
            <span className={styles.primaryLabel}>Dashboard</span>
          </button>
          <button type="button" className={styles.primaryRow} onClick={onNewChat}>
            <Icon svg={newChatIcon} className={styles.rowIcon} />
            <span className={styles.primaryLabel}>New Chat</span>
          </button>
          <button type="button" className={styles.primaryRow}>
            <Icon svg={artifactsIcon} className={styles.rowIcon} />
            <span className={styles.primaryLabel}>Artifacts</span>
          </button>
          <div className={styles.divider} />
        </div>

        <div className={`${styles.history} thin-scroll`}>
          <HistorySection title="Projects" items={starredHistory} onOpenChat={onOpenChat} />
          <HistorySection title="Recents" items={recentsHistory} onOpenChat={onOpenChat} />
        </div>

        <div className={styles.footer}>
          <div className={styles.wsRow}>
            <div className={styles.wsChips}>
              {state.workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  className={styles.wsChipSmall}
                  data-active={ws.id === activeWorkspace.id}
                  data-tooltip={ws.name}
                  aria-label={`Open ${ws.name}`}
                  onClick={() => actions.selectWorkspace(ws.id)}
                >
                  <Letter ws={ws} />
                </button>
              ))}
              <button
                ref={plusRef}
                type="button"
                className={styles.wsAdd}
                aria-label="New workspace"
                onClick={() => openSwitcher(plusRef.current, 'create')}
              >
                <Icon svg={addSmallIcon} size={14} />
              </button>
            </div>
            <button
              ref={dotsRef}
              type="button"
              className={styles.iconButton}
              aria-label="Workspaces"
              onClick={() => openSwitcher(dotsRef.current, 'list')}
            >
              <Icon svg={dotsV2Icon} size={14} />
            </button>
          </div>
          <div className={styles.divider} />
          <div className={styles.footerRow}>
            <div className={styles.profile}>
              <span className={styles.profileIconWrap}>
                <Icon svg={profileIcon} />
              </span>
              <span className={styles.username}>Mark</span>
            </div>
            <div className={styles.footerActions}>
              <button type="button" className={`${styles.iconButton} ${styles.memoryButton}`} aria-label="Memory">
                <Icon svg={memoryIcon} />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Settings">
                <Icon svg={settingsIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {switcherPopover}
    </aside>
  )
}
