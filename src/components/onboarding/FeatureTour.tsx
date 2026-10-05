import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { closeIcon } from '../../assets/icons'
import { tourSteps, type TourPlacement } from '../../data/onboarding'
import { usePrototype } from '../../store/prototype'
import ui from '../ui/controls.module.css'
import styles from './FeatureTour.module.css'

const GAP = 14
const MARGIN = 12

type Pos = { left: number; top: number; placement: TourPlacement; arrow: number }

/** first matching anchor that is actually on screen */
function findAnchor(name: string) {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`))
  return all.find((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
}

export function FeatureTour() {
  const { actions } = usePrototype()
  const [index, setIndex] = useState(0)
  const [pos, setPos] = useState<Pos | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLElement | null>(null)
  const step = tourSteps[index]
  const last = index === tourSteps.length - 1

  const measure = useCallback(() => {
    const el = anchorRef.current
    const card = cardRef.current
    if (!el || !card) return
    const a = el.getBoundingClientRect()
    const cw = card.offsetWidth
    const ch = card.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    let placement = step.placement
    // flip when there's no room on the preferred side
    if (placement === 'top' && a.top - ch - GAP < MARGIN) placement = 'bottom'
    if (placement === 'left' && a.left - cw - GAP < MARGIN) placement = 'right'
    if (placement === 'right' && a.right + cw + GAP > vw - MARGIN) placement = 'left'

    let left: number
    let top: number
    if (placement === 'top' || placement === 'bottom') {
      left = a.left + a.width / 2 - cw / 2
      top = placement === 'top' ? a.top - ch - GAP : a.bottom + GAP
    } else {
      left = placement === 'left' ? a.left - cw - GAP : a.right + GAP
      top = a.top + a.height / 2 - ch / 2
    }
    left = Math.max(MARGIN, Math.min(left, vw - cw - MARGIN))
    top = Math.max(MARGIN, Math.min(top, vh - ch - MARGIN))
    const arrow =
      placement === 'top' || placement === 'bottom'
        ? Math.max(18, Math.min(a.left + a.width / 2 - left, cw - 18))
        : Math.max(18, Math.min(a.top + a.height / 2 - top, ch - 18))
    setPos((p) =>
      p && p.left === left && p.top === top && p.placement === placement && p.arrow === arrow ? p : { left, top, placement, arrow },
    )
  }, [step.placement])

  // attach to this step's anchor (skipping any that aren't on screen)
  useLayoutEffect(() => {
    const el = findAnchor(step.anchor)
    if (!el) {
      if (last) actions.endTour()
      else setIndex((i) => i + 1)
      return
    }
    anchorRef.current = el
    el.setAttribute('data-tour-active', '')
    measure()
    return () => el.removeAttribute('data-tour-active')
  }, [actions, last, measure, step.anchor])

  // keep following the anchor through resizes and layout transitions
  useEffect(() => {
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    const t = window.setInterval(measure, 250)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      window.clearInterval(t)
    }
  }, [measure])

  const next = useCallback(() => {
    if (last) actions.endTour()
    else setIndex((i) => i + 1)
  }, [actions, last])

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') actions.endTour()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') back()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [actions, back, next])

  return createPortal(
    <div
      ref={cardRef}
      key={index}
      className={styles.tip}
      data-placement={pos?.placement ?? step.placement}
      data-ready={pos !== null}
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
      role="dialog"
      aria-label={step.title}
    >
      <span
        className={styles.arrow}
        style={pos && (pos.placement === 'top' || pos.placement === 'bottom') ? { left: pos.arrow } : { top: pos?.arrow ?? 0 }}
        aria-hidden
      />
      <div className={styles.head}>
        <span className={styles.counter}>
          {index + 1} of {tourSteps.length}
        </span>
        <button type="button" className={styles.close} onClick={actions.endTour} aria-label="Close tips">
          <Icon svg={closeIcon} size={14} />
        </button>
      </div>
      <h3 className={styles.title}>{step.title}</h3>
      <p className={styles.body}>{step.body}</p>
      <div className={styles.foot}>
        <div className={styles.progress} aria-hidden>
          {tourSteps.map((s, i) => (
            <span key={s.anchor} data-state={i < index ? 'done' : i === index ? 'current' : 'todo'} />
          ))}
        </div>
        <div className={styles.buttons}>
          {index > 0 && (
            <button type="button" className={styles.back} onClick={back}>
              Back
            </button>
          )}
          {last && (
            <button
              type="button"
              className={`${ui.btn} ${ui.btnSm} ${ui.btnSecondary}`}
              onClick={() => {
                actions.endTour()
                actions.goHome()
              }}
            >
              Open dashboard
            </button>
          )}
          <button type="button" className={`${ui.btn} ${ui.btnSm} ${ui.btnInvert}`} onClick={next} autoFocus>
            {last ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
