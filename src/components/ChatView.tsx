import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ChatInput } from './ChatInput'
import { TrustBar } from './TrustBar'
import { Icon } from './Icon'
import { ChatOutline, type OutlineGroup } from './ChatOutline'
import { ToolLogo } from './dashboard/ToolLogo'
import { copyIcon, filesIcon, lockerIcon, markerIcon, outlineIcon } from '../assets/icons'
import { ActionCard, ToolCard } from './ToolCard'
import { plainText, type AnswerBlock, type ChatMessage } from '../data/messages'
import { usePrototype } from '../store/prototype'
import ui from './ui/controls.module.css'
import styles from './ChatView.module.css'

type ChatViewProps = {
  messages: ChatMessage[]
  onSend: (message: string) => void
}

const OUTLINE_W = 220
const OUTLINE_GAP = 40
const COLUMN = 600 // the message column, padding included
const COLUMN_PAD = 24

const anchorId = (id: string) => `chat-anchor-${id}`

/** **bold** → <b> */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part))}
    </>
  )
}

function shorten(text: string, max = 52) {
  const clean = plainText(text).replace(/^[“"]/, '')
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean
}

type MarkHandler = (e: ReactMouseEvent, blockId: string, text: string) => void

function Answer({ blocks, marks, onContext }: { blocks: AnswerBlock[]; marks: Set<string>; onContext: MarkHandler }) {
  const markable = (id: string, text: string) => ({
    id: anchorId(id),
    'data-marked': marks.has(id) || undefined,
    onContextMenu: (e: ReactMouseEvent) => onContext(e, id, plainText(text)),
  })

  return (
    <div className={styles.answer}>
      {blocks.map((block) => {
        switch (block.type) {
          case 'h':
            return (
              <h3 key={block.id} id={anchorId(block.id)} className={styles.answerHeading}>
                {block.text}
              </h3>
            )
          case 'p':
            return (
              <p key={block.id} className={`${styles.answerText} ${styles.markable}`} {...markable(block.id, block.text)}>
                <span className={styles.markText}>
                  <Rich text={block.text} />
                </span>
              </p>
            )
          case 'quote':
            return (
              <blockquote key={block.id} className={`${styles.answerQuote} ${styles.markable}`} {...markable(block.id, block.text)}>
                <span className={styles.markText}>{block.text}</span>
              </blockquote>
            )
          case 'ul':
            return (
              <ul key={block.id} className={styles.answerList}>
                {block.items.map((item) => (
                  <li key={item.id} className={styles.markable} {...markable(item.id, item.text)}>
                    <span className={styles.markText}>
                      <Rich text={item.text} />
                    </span>
                  </li>
                ))}
              </ul>
            )
        }
      })}
    </div>
  )
}

function MessageRow({ message, marks, onContext }: { message: ChatMessage; marks: Set<string>; onContext: MarkHandler }) {
  if (message.role === 'context') {
    const kinds = Array.from(new Set(message.kinds)).slice(0, 4)
    return (
      <div className={styles.contextCard}>
        <span className={styles.contextLogos}>
          {kinds.map((kind) => (
            <ToolLogo key={kind} kind={kind} size={24} className={styles.contextLogo} />
          ))}
        </span>
        <span className={styles.contextText}>
          <span className={styles.contextTitle}>{message.title}</span>
          <span className={styles.contextDetail}>{message.detail}</span>
        </span>
        <span className={styles.contextBadge}>
          <Icon svg={lockerIcon} size={10} />
          Added as context
        </span>
      </div>
    )
  }

  if (message.role === 'tool') {
    return <ToolCard message={message} />
  }

  if (message.role === 'action') {
    return <ActionCard message={message} />
  }

  if (message.role === 'answer') {
    return <Answer blocks={message.blocks} marks={marks} onContext={onContext} />
  }

  if (message.role === 'user') {
    return (
      <div id={anchorId(message.id)} className={styles.userBubble}>
        {message.attachments && (
          <div className={styles.attachments}>
            {message.attachments.map((file) => (
              <span key={file.name} className={styles.file}>
                <span className={styles.fileIcon}>
                  <Icon svg={filesIcon} size={14} />
                </span>
                <span className={styles.fileText}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileMeta}>{file.meta}</span>
                </span>
              </span>
            ))}
          </div>
        )}
        {message.text}
      </div>
    )
  }

  return <div className={styles.wispBubble}>{message.text}</div>
}

type Menu = { x: number; y: number; blockId: string; text: string }

export function ChatView({ messages, onSend }: ChatViewProps) {
  const { state, actions } = usePrototype()
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLButtonElement>(null)
  const [width, setWidth] = useState(0)
  // folded state the user chose; untouched groups follow the default below
  const [folded, setFolded] = useState<Record<string, boolean>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const marks = useMemo(() => new Set(state.chatMarks), [state.chatMarks])

  // prompts → Wisp's section headings + anything the user marked, in reading order
  const groups = useMemo<OutlineGroup[]>(() => {
    const out: OutlineGroup[] = []
    for (const m of messages) {
      if (m.role === 'user') {
        out.push({ id: m.id, prompt: m.text, items: [] })
        continue
      }
      if (m.role !== 'answer' || !out.length) continue
      const items = out[out.length - 1].items
      for (const b of m.blocks) {
        if (b.type === 'h') items.push({ id: b.id, kind: 'heading', text: b.text })
        else if (b.type === 'ul') {
          b.items.forEach((li) => {
            if (marks.has(li.id)) items.push({ id: li.id, kind: 'mark', text: shorten(li.text) })
          })
        } else if (marks.has(b.id)) items.push({ id: b.id, kind: 'mark', text: shorten(b.text) })
      }
    }
    return out
  }, [messages, marks])

  const hasOutline = groups.some((g) => g.items.length > 0)

  // by default only the latest prompt is open; earlier ones fold away
  const lastGroupId = groups[groups.length - 1]?.id
  const collapsed = useMemo(
    () => new Set(groups.filter((g) => folded[g.id] ?? g.id !== lastGroupId).map((g) => g.id)),
    [groups, folded, lastGroupId],
  )

  /* ------------------------------------------------------------ layout */

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const contentLeft = (width - Math.min(COLUMN, width)) / 2 + COLUMN_PAD
  // open beside the conversation when there's room, otherwise a small floating button
  const docked = contentLeft >= OUTLINE_W + OUTLINE_GAP + 16
  const outlineLeft = Math.max(16, contentLeft - OUTLINE_GAP - OUTLINE_W)
  const iconLeft = Math.max(12, contentLeft - 52)
  const cramped = !docked && contentLeft - 52 < 12

  /* -------------------------------------------------------- scroll spy */

  const updateActive = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const top = container.getBoundingClientRect().top
    let current: string | null = null
    const ids = groups.flatMap((g) => [g.id, ...g.items.map((i) => i.id)])
    for (const id of ids) {
      const el = document.getElementById(anchorId(id))
      if (el && el.getBoundingClientRect().top - top <= 120) current = id
    }
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 4) {
      // at the very bottom the last section is "current", even if it's short
      const last = groups[groups.length - 1]
      current = last?.items[last.items.length - 1]?.id ?? last?.id ?? current
    }
    setActiveId(current ?? groups[0]?.id ?? null)
  }, [groups])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateActive)
    }
    frame = requestAnimationFrame(updateActive)
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      container.removeEventListener('scroll', onScroll)
    }
  }, [updateActive])

  const jumpTo = (id: string) => {
    const container = scrollRef.current
    const el = document.getElementById(anchorId(id))
    if (!container || !el) return
    const y = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 28
    container.scrollTo({ top: y, behavior: 'smooth' })
    el.setAttribute('data-flash', '')
    window.setTimeout(() => el.removeAttribute('data-flash'), 1400)
    if (!docked) setPopoverOpen(false)
  }

  const toggleGroup = (id: string) => setFolded((current) => ({ ...current, [id]: !collapsed.has(id) }))

  /* ----------------------------------------------------- right-click menu */

  const openMenu: MarkHandler = (e, blockId, text) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, blockId, text })
  }

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('[data-chat-menu]')) close()
    }
    const scroller = scrollRef.current
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('blur', close)
    scroller?.addEventListener('scroll', close, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blur', close)
      scroller?.removeEventListener('scroll', close)
    }
  }, [menu])

  const copy = async () => {
    if (!menu) return
    const selection = window.getSelection()?.toString().trim()
    const text = selection || menu.text
    setMenu(null)
    try {
      await navigator.clipboard.writeText(text)
      actions.toast(selection ? 'Selection copied' : 'Paragraph copied')
    } catch {
      actions.toast('Copy isn’t available in this browser view')
    }
  }

  const toggleMark = () => {
    if (!menu) return
    const wasMarked = marks.has(menu.blockId)
    actions.toggleMark(menu.blockId)
    setMenu(null)
    if (!wasMarked && !docked) {
      // the outline is tucked away — give its button a little nudge
      const btn = iconRef.current
      btn?.setAttribute('data-bump', '')
      window.setTimeout(() => btn?.removeAttribute('data-bump'), 700)
    }
  }

  /* ------------------------------------------- floating outline popover */

  useEffect(() => {
    if (!popoverOpen) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (popoverRef.current?.contains(target) || iconRef.current?.contains(target)) return
      setPopoverOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverOpen(false)
    }
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [popoverOpen])

  const outline = (variant: 'docked' | 'popover') => (
    <ChatOutline
      groups={groups}
      activeId={activeId}
      collapsed={collapsed}
      variant={variant}
      showTip={marks.size === 0}
      onToggle={toggleGroup}
      onJump={jumpTo}
      onUnmark={actions.toggleMark}
    />
  )

  const menuX = menu ? Math.min(menu.x, window.innerWidth - 200) : 0
  const menuY = menu ? Math.min(menu.y, window.innerHeight - 110) : 0

  return (
    <div className={styles.chatView} ref={rootRef} data-cramped={(hasOutline && cramped) || undefined}>
      <div className={`${styles.scroll} thin-scroll`} ref={scrollRef}>
        <div className={styles.messages}>
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} marks={marks} onContext={openMenu} />
          ))}
        </div>
      </div>

      {hasOutline && width > 0 && docked && (
        <aside className={`${styles.outlineDock} thin-scroll`} style={{ left: outlineLeft, width: OUTLINE_W }}>
          {outline('docked')}
        </aside>
      )}

      {hasOutline && width > 0 && !docked && (
        <>
          <button
            ref={iconRef}
            type="button"
            className={styles.outlineButton}
            style={{ left: iconLeft }}
            aria-expanded={popoverOpen}
            aria-label="Chat outline"
            title="Chat outline"
            onClick={() => setPopoverOpen((v) => !v)}
          >
            <Icon svg={outlineIcon} />
            {marks.size > 0 && <span className={styles.outlineBadge}>{marks.size}</span>}
          </button>
          {popoverOpen && (
            <div ref={popoverRef} className={`${styles.outlinePopover} thin-scroll`} style={{ left: iconLeft }}>
              {outline('popover')}
            </div>
          )}
        </>
      )}

      <div className={styles.dock}>
        <div className={styles.dockInner}>
          <ChatInput onSend={onSend} showContextUsage />
          <TrustBar />
        </div>
      </div>

      {menu &&
        createPortal(
          <div
            className={styles.contextMenu}
            style={{ left: menuX, top: menuY }}
            data-chat-menu
            role="menu"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className={ui.menu} style={{ minWidth: 180 }}>
              <button type="button" className={ui.menuItem} role="menuitem" onClick={copy}>
                <Icon svg={copyIcon} size={14} />
                <span className={ui.menuLabel}>Copy</span>
                <span className={ui.menuHint}>⌘C</span>
              </button>
              <button type="button" className={ui.menuItem} role="menuitem" onClick={toggleMark}>
                <Icon svg={markerIcon} size={14} />
                <span className={ui.menuLabel}>{marks.has(menu.blockId) ? 'Remove mark' : 'Mark'}</span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
