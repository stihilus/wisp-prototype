import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../Icon'
import { ToolLogo } from './ToolLogo'
import { arrowRightIcon, checkIcon, circleUncheckIcon } from '../../assets/icons'
import type { ChatItem, Widget, WidgetBodySpec, WidgetContent } from '../../data/dashboard'
import styles from './WidgetBody.module.css'

export type BodyVariant = 'grid' | 'feed'

type BodyProps = {
  widget: Widget
  content: WidgetContent
  size: { w: number; h: number }
  variant: BodyVariant
  rowActionLabel?: string
  onRowAction?: (label: string, detail: string) => void
  onToggleTodo?: (id: string) => void
}

/** Marks the list as overflowing so it can fade out instead of hard-clipping. */
function useOverflow<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [overflowing, setOverflowing] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    Array.from(el.children).forEach((c) => ro.observe(c))
    return () => ro.disconnect()
  })
  return [ref, overflowing] as const
}

function FadeList({ children, className }: { children: ReactNode; className?: string }) {
  const [ref, overflowing] = useOverflow<HTMLDivElement>()
  return (
    <div ref={ref} className={`${styles.list} ${className ?? ''}`} data-overflow={overflowing}>
      {children}
    </div>
  )
}

function Avatar({ chat }: { chat: ChatItem }) {
  return (
    <span className={styles.avatar} style={{ background: `linear-gradient(180deg, ${chat.gradient[0]}, ${chat.gradient[1]})` }}>
      {chat.initials}
    </span>
  )
}

function ChatRows({
  items,
  variant,
  action,
  onRowAction,
}: {
  items: ChatItem[]
  variant: BodyVariant
  action: string
  onRowAction?: BodyProps['onRowAction']
}) {
  return (
    <FadeList>
      {items.map((chat) => (
        <div
          key={chat.id}
          className={styles.chatRow}
          data-muted={chat.muted || undefined}
          data-variant={variant}
          role="button"
          tabIndex={0}
          onClick={() => onRowAction?.(chat.name, chat.text)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRowAction?.(chat.name, chat.text)
          }}
        >
          <Avatar chat={chat} />
          <div className={styles.chatText}>
            <div className={styles.chatTop}>
              <span className={styles.chatName}>{chat.name}</span>
              <span className={styles.chatCount}>{chat.count} new</span>
              {variant === 'grid' && (
                <span className={styles.rowAction}>
                  {action}
                  <Icon svg={arrowRightIcon} size={12} />
                </span>
              )}
            </div>
            <p className={styles.chatMessage}>{chat.text}</p>
            {variant === 'feed' && (
              <span className={styles.feedAction}>
                {action}
                <Icon svg={arrowRightIcon} size={12} />
              </span>
            )}
          </div>
        </div>
      ))}
    </FadeList>
  )
}

/* ------------------------------------------------------------- PostHog */

const visitors = [
  320, 335, 330, 345, 340, 352, 348, 360, 356, 362, 358, 365, 372, 368, 380, 376, 390, 402, 980, 700, 540, 512, 505, 518, 530, 526,
  540, 548, 556, 572,
]

function TrafficChart({ compact }: { compact: boolean }) {
  const max = 1100
  const n = visitors.length
  const pts = visitors.map((v, i) => [(i / (n - 1)) * 100, 100 - (v / max) * 100] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} L100,100 L0,100 Z`
  const spike = pts[18]

  return (
    <div className={styles.traffic} data-compact={compact}>
      <div className={styles.chartArea}>
        <div className={styles.gridLines} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <svg className={styles.chartSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="phArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c93ff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6c93ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#phArea)" />
          <path d={line} fill="none" stroke="#6c93ff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
        <span className={styles.spikeDot} style={{ left: `${spike[0]}%`, top: `${spike[1]}%` }} />
        {!compact && (
          <span className={styles.spikeNote} style={{ left: `${spike[0]}%`, top: `${spike[1]}%` }}>
            <span className={styles.spikeTitle}>Sep 18 · 980 visitors</span>
            <span className={styles.spikeSub}>“Is ChatGPT safe?” went live</span>
          </span>
        )}
      </div>
      <div className={styles.axis}>
        <span>Aug 31</span>
        <span>Sep 15</span>
        <span>Sep 29</span>
      </div>
    </div>
  )
}

function Kpis() {
  const kpis = [
    { label: 'App downloads', value: '1,905', change: '↑ 12%' },
    { label: 'Sign-ups', value: '342', change: '↑ 9%' },
    { label: 'Top page', value: '/private-ai', change: '31% of visits' },
  ]
  return (
    <div className={styles.kpis}>
      {kpis.map((k) => (
        <div key={k.label} className={styles.kpi}>
          <span className={styles.kpiLabel}>{k.label}</span>
          <span className={styles.kpiValue}>
            {k.value}
            <span className={styles.kpiChange}>{k.change}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function Traffic({ size, variant }: { size: { w: number; h: number }; variant: BodyVariant }) {
  const roomy = size.w >= 2 && size.h >= 2 && variant === 'grid'
  return (
    <div className={styles.trafficWrap}>
      <div className={styles.metricHead}>
        <span className={styles.metricLabel}>Unique visitors</span>
        <div className={styles.metricRow}>
          <span className={styles.metricValue} data-small={size.w < 2 || undefined}>
            12,480
          </span>
          <span className={styles.deltaBadge}>↑ 18%</span>
          {size.w >= 2 && <span className={styles.metricNote}>vs previous 30 days</span>}
        </div>
      </div>
      {size.h >= 2 || size.w >= 2 ? <TrafficChart compact={!roomy} /> : null}
      {roomy && <Kpis />}
    </div>
  )
}

function Funnel() {
  const steps = [
    { label: 'Visited', value: '12,480', pct: 100 },
    { label: 'Downloaded', value: '1,905', pct: 15.3 },
    { label: 'Signed up', value: '342', pct: 2.7 },
  ]
  return (
    <FadeList className={styles.funnel}>
      {steps.map((s) => (
        <div key={s.label} className={styles.funnelRow}>
          <div className={styles.funnelTop}>
            <span className={styles.rowTitle}>{s.label}</span>
            <span className={styles.rowMeta}>
              {s.value} · {s.pct}%
            </span>
          </div>
          <span className={styles.funnelTrack}>
            <span className={styles.funnelBar} style={{ width: `${Math.max(3, s.pct)}%` }} />
          </span>
        </div>
      ))}
    </FadeList>
  )
}

/* -------------------------------------------------------------- Health */

const vitals = [
  { label: 'Steps', value: '8,420', unit: 'today', color: '#ff9e0a', bars: [5200, 7400, 4300, 8800, 6100, 9800, 8420] },
  { label: 'Sleep', value: '7h 12m', unit: 'last night', color: '#6b94ff', bars: [6.5, 6.9, 7.8, 6.2, 7.5, 6.8, 7.2] },
  { label: 'Resting heart rate', value: '58 bpm', unit: '7-day avg', color: '#ff385e', bars: [9, 11, 12, 9, 10, 9, 8] },
]

function Vitals({ size }: { size: { w: number; h: number } }) {
  const stacked = size.w < 2
  return (
    <FadeList className={stacked ? styles.vitalsStack : styles.vitals}>
      {vitals.map((v) => {
        const max = Math.max(...v.bars)
        return (
          <div key={v.label} className={styles.vital}>
            <span className={styles.kpiLabel}>{v.label}</span>
            <span className={styles.vitalValue}>
              {v.value}
              <span className={styles.kpiChange}>{v.unit}</span>
            </span>
            <span className={styles.vitalBars}>
              {v.bars.map((b, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.round((b / max) * 100)}%`, background: v.color, opacity: i === v.bars.length - 1 ? 1 : 0.4 }}
                />
              ))}
            </span>
          </div>
        )
      })}
    </FadeList>
  )
}

/* ---------------------------------------------------------------- Bars */

function Bars({ spec, content, size }: { spec: Extract<WidgetBodySpec, { type: 'bars' }>; content: WidgetContent; size: { w: number; h: number } }) {
  const max = Math.max(...spec.values)
  const wide = size.w >= 2
  return (
    <div className={styles.barsBody} data-wide={wide}>
      <div className={styles.barsStats}>
        <div>
          <h3 className={styles.headline}>{content.headline}</h3>
          {content.sub && <p className={styles.sub}>{content.sub}</p>}
        </div>
        <div className={styles.bigNumberBlock}>
          <span className={styles.bigNumber}>{spec.value}</span>
          <span className={styles.bigNumberSub}>{spec.valueSub}</span>
        </div>
      </div>
      <div className={styles.barsChart}>
        {spec.values.map((v, i) => (
          <span key={i} className={styles.bar} data-last={i === spec.values.length - 1} style={{ height: `${Math.round((v / max) * 100)}%` }} />
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- body */

export function bodyHasOwnHeading(spec: WidgetBodySpec) {
  return spec.type === 'traffic' || spec.type === 'vitals' || spec.type === 'bars'
}

export function WidgetBody({ widget, content, size, variant, rowActionLabel = 'Ask Wisp', onRowAction, onToggleTodo }: BodyProps) {
  const spec = content.body

  switch (spec.type) {
    case 'chats':
      return <ChatRows items={spec.items} variant={variant} action={rowActionLabel} onRowAction={onRowAction} />

    case 'emails':
      return (
        <FadeList>
          {spec.items.map((row) => (
            <div key={row.title} className={styles.emailRow} role="button" tabIndex={0} onClick={() => onRowAction?.(row.title, row.sub)}>
              <span className={styles.emailFrom}>{row.title}</span>
              <span className={styles.emailSubject}>{row.sub}</span>
            </div>
          ))}
        </FadeList>
      )

    case 'rows':
      return (
        <FadeList>
          {spec.items.map((row, i) => (
            <div key={`${row.title}-${i}`} className={styles.docRow} role="button" tabIndex={0} onClick={() => onRowAction?.(row.title, row.sub)}>
              <span className={styles.rowTitle}>{row.title}</span>
              <span className={styles.rowSub}>{row.sub}</span>
            </div>
          ))}
        </FadeList>
      )

    case 'agenda':
      return (
        <FadeList className={styles.agenda}>
          {spec.items.map((row) => (
            <div key={row.time} className={styles.agendaRow}>
              <span className={styles.agendaTime}>{row.time}</span>
              <span className={styles.agendaTitle}>{row.title}</span>
            </div>
          ))}
        </FadeList>
      )

    case 'todos': {
      const done = widget.done ?? []
      const cap = variant === 'feed' ? 3 : size.h >= 2 ? spec.items.length : size.w >= 2 ? 3 : 2
      const visible = spec.items.slice(0, cap)
      const hidden = spec.items.length - visible.length
      return (
        <div className={styles.todos}>
          <FadeList className={styles.todoList}>
          {visible.map((todo) => {
            const isDone = done.includes(todo.id)
            return (
              <button
                key={todo.id}
                type="button"
                className={styles.todo}
                data-done={isDone}
                data-no-drag
                onClick={() => onToggleTodo?.(todo.id)}
              >
                <span className={styles.todoBox}>
                  {isDone ? <Icon svg={checkIcon} size={10} /> : <Icon svg={circleUncheckIcon} size={16} />}
                </span>
                <span className={styles.todoText}>{todo.text}</span>
              </button>
            )
          })}
          </FadeList>
          {hidden > 0 && <span className={styles.more}>+{hidden} more</span>}
        </div>
      )
    }

    case 'traffic':
      return <Traffic size={size} variant={variant} />

    case 'funnel':
      return <Funnel />

    case 'vitals':
      return <Vitals size={size} />

    case 'bars':
      return <Bars spec={spec} content={content} size={size} />

    case 'digest':
      return (
        <FadeList>
          {spec.items.map((item, i) => (
            <div key={i} className={styles.digestRow}>
              <ToolLogo kind={item.tool} size={18} />
              <span className={styles.digestText}>{item.text}</span>
            </div>
          ))}
        </FadeList>
      )
  }
}
