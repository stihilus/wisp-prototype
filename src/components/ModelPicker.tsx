import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { TourCursor } from './TourCursor'
import { closeIcon, downIcon, modelMoreIcon } from '../assets/icons'
import { modelOptions, modelTiers } from '../data/models'
import styles from './ModelPicker.module.css'

type ModelPickerProps = {
  guidedTrigger: number
  autoSelectModelId?: string
}

type CursorState = { x: number; y: number; visible: boolean; tapping: boolean }

function centerOf(el: HTMLElement | null) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export function ModelPicker({ guidedTrigger, autoSelectModelId }: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [modelsOpen, setModelsOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState('advanced')
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [cursor, setCursor] = useState<CursorState | null>(null)
  const [showTip, setShowTip] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const moreRowRef = useRef<HTMLButtonElement>(null)
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const closeAndReset = () => {
    setOpen(false)
    setModelsOpen(false)
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        closeAndReset()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    // guidedTrigger is a counter that increments only on "Try <model>"; the
    // caller resets it back to 0 as soon as a plain "New Chat" happens, so
    // any other value here (including a fresh mount that inherits it) is a
    // real trigger, not a replay. This plays like a tiny recorded demo — a
    // cursor fades in, taps Auto, taps More, taps the model, and everything
    // closes with it selected. Nothing here waits on the user.
    if (!guidedTrigger) return

    const timers: number[] = []
    const schedule = (fn: () => void, delay: number) => timers.push(window.setTimeout(fn, delay))

    const startPos = centerOf(triggerRef.current)
    if (!startPos) return
    setCursor({ x: startPos.x, y: startPos.y - 24, visible: false, tapping: false })
    schedule(() => setCursor((c) => c && { ...c, visible: true }), 60)

    // tap Auto -> open the tier panel
    schedule(() => {
      setCursor((c) => c && { ...c, tapping: true })
      setOpen(true)
    }, 520)
    schedule(() => setCursor((c) => c && { ...c, tapping: false }), 700)

    // glide to "More"
    schedule(() => {
      const p = centerOf(moreRowRef.current)
      if (p) setCursor((c) => c && { ...c, x: p.x, y: p.y })
    }, 880)

    // tap More -> expand the full model list
    schedule(() => {
      setCursor((c) => c && { ...c, tapping: true })
      setModelsOpen(true)
    }, 1380)
    schedule(() => setCursor((c) => c && { ...c, tapping: false }), 1560)

    // glide to the model to try
    schedule(() => {
      requestAnimationFrame(() => {
        const target = autoSelectModelId ? rowRefs.current[autoSelectModelId] : null
        target?.scrollIntoView({ block: 'nearest' })
        const p = centerOf(target ?? null)
        if (p) setCursor((c) => c && { ...c, x: p.x, y: p.y })
      })
    }, 1740)

    // tap the model -> select it
    schedule(() => {
      setCursor((c) => c && { ...c, tapping: true })
      if (autoSelectModelId) setSelectedModel(autoSelectModelId)
    }, 2260)

    // fade the cursor out and close the picker
    schedule(() => {
      setCursor((c) => c && { ...c, visible: false })
      closeAndReset()
    }, 2500)

    // once the cursor is gone, leave a small coachmark behind
    schedule(() => {
      setCursor(null)
      setShowTip(true)
    }, 2800)

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      setCursor(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guidedTrigger])

  const currentLabel = selectedModel
    ? modelOptions.find((m) => m.id === selectedModel)?.name ?? 'Auto'
    : 'Auto'

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => {
          setShowTip(false)
          if (open) closeAndReset()
          else setOpen(true)
        }}
      >
        {currentLabel}
        <Icon svg={downIcon} />
      </button>

      {open && (
        <div className={styles.panelsRow}>
          {modelsOpen && (
            <div className={`${styles.panel} ${styles.modelPanel} thin-scroll`} role="menu">
              {modelOptions.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  ref={(el) => {
                    rowRefs.current[model.id] = el
                  }}
                  className={styles.row}
                  data-selected={selectedModel === model.id}
                  onClick={() => {
                    setSelectedModel(model.id)
                    closeAndReset()
                  }}
                >
                  <span className={styles.rowTitle}>
                    {model.name}
                    {model.beta && <sup className={styles.beta}>beta</sup>}
                  </span>
                  <span className={styles.rowSubtitle}>{model.description}</span>
                </button>
              ))}
            </div>
          )}

          <div className={styles.panel} role="menu">
            {modelTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                className={styles.row}
                data-selected={selectedTier === tier.id && !selectedModel}
                onClick={() => {
                  setSelectedTier(tier.id)
                  setSelectedModel(null)
                  closeAndReset()
                }}
              >
                <span className={styles.rowTitle}>{tier.name}</span>
                <span className={styles.rowSubtitle}>{tier.description}</span>
              </button>
            ))}
            <button
              ref={moreRowRef}
              type="button"
              className={styles.moreRow}
              data-active={modelsOpen}
              onClick={() => setModelsOpen((v) => !v)}
            >
              <span className={styles.moreText}>
                <span className={styles.rowTitle}>More</span>
                <span className={styles.rowSubtitle}>Pick a specific model</span>
              </span>
              <Icon svg={modelMoreIcon} className={styles.moreChevron} />
            </button>
          </div>
        </div>
      )}

      {showTip && (
        <div className={styles.coachmark}>
          <button
            type="button"
            className={styles.coachmarkClose}
            onClick={() => setShowTip(false)}
            aria-label="Dismiss tip"
          >
            <Icon svg={closeIcon} size={10} />
          </button>
          <p>Every model lives here — come back anytime you want to choose one yourself instead of Auto.</p>
        </div>
      )}

      {cursor && <TourCursor {...cursor} />}
    </div>
  )
}
