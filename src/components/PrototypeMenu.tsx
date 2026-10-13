import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { Popover } from './ui/Popover'
import { chevSmallIcon, feedbackFilledIcon } from '../assets/icons'
import { usePrototype, type Scenario } from '../store/prototype'
import { planOrder, plans, type UsageLevel } from '../data/usage'
import ui from './ui/controls.module.css'
import styles from './PrototypeMenu.module.css'

const scenarios: { id: Scenario; title: string; desc: string }[] = [
  { id: 'empty', title: 'Empty — first run', desc: 'Suggestions only, nothing connected' },
  { id: 'few', title: 'A couple connected', desc: 'Telegram + Gmail, the rest in one line' },
  { id: 'all', title: 'Everything connected', desc: 'Full dashboard, charts included' },
]

const usageLevels: { id: UsageLevel; label: string }[] = [
  { id: 'normal', label: '30%' },
  { id: 'pace', label: 'Week pace' },
  { id: 'near', label: '75%' },
  { id: 'reached', label: '100%' },
]

// Not part of the product — a small control for whoever is demoing the
// prototype, so they can jump between the Figma states without clicking
// through every flow.
export function PrototypeMenu() {
  const { state, activeWorkspace, actions } = usePrototype()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button ref={ref} type="button" className={styles.pill} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={styles.dot} />
        Prototype
        <Icon svg={chevSmallIcon} size={12} />
      </button>
      {open && (
        <Popover anchor={ref.current} onClose={() => setOpen(false)} placement="bottom-end" offset={8} className={styles.popover}>
          <div className={ui.menu}>
            <span className={`${ui.sectionLabel} ${styles.label}`}>Onboarding</span>
            <button
              type="button"
              className={ui.menuItem}
              onClick={() => {
                setOpen(false)
                actions.openWelcome()
              }}
            >
              <span className={styles.step}>1st</span>
              <span className={styles.text}>
                <span className={styles.title}>First launch — Welcome</span>
                <span className={styles.desc}>Welcome screen and the 5-step intro, on a fresh chat</span>
              </span>
            </button>
            <button
              type="button"
              className={ui.menuItem}
              onClick={() => {
                setOpen(false)
                actions.startTour()
              }}
            >
              <span className={styles.step}>2nd</span>
              <span className={styles.text}>
                <span className={styles.title}>Second launch — Feature tips</span>
                <span className={styles.desc}>Step-by-step tips: model, Thinking, Projects, connectors…</span>
              </span>
            </button>
            <button
              type="button"
              className={ui.menuItem}
              onClick={() => {
                setOpen(false)
                actions.nudgeReport()
              }}
            >
              <span className={styles.step}>
                <Icon svg={feedbackFilledIcon} size={12} />
              </span>
              <span className={styles.text}>
                <span className={styles.title}>Report nudge</span>
                <span className={styles.desc}>Pulse the Report button and pop a short hint</span>
              </span>
            </button>
            <div className={ui.menuDivider} />
            <span className={`${ui.sectionLabel} ${styles.label}`}>Dashboard · jump {activeWorkspace.name} to</span>
            {scenarios.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={ui.menuItem}
                onClick={() => {
                  setOpen(false)
                  actions.applyScenario(s.id)
                }}
              >
                <span className={styles.step}>{i + 1}</span>
                <span className={styles.text}>
                  <span className={styles.title}>{s.title}</span>
                  <span className={styles.desc}>{s.desc}</span>
                </span>
              </button>
            ))}
            <div className={ui.menuDivider} />
            {/* stays open so you can watch the ring, pill and banner change */}
            <span className={`${ui.sectionLabel} ${styles.label}`}>Plan & usage</span>
            <div className={styles.segRow}>
              <span className={styles.segLabel}>Plan</span>
              <div className={styles.seg}>
                {planOrder.map((p) => (
                  <button key={p} type="button" data-active={state.usage.plan === p} onClick={() => actions.setPlan(p)}>
                    {plans[p].short}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.segRow}>
              <span className={styles.segLabel}>Usage</span>
              <div className={styles.seg}>
                {usageLevels.map((l) => (
                  <button key={l.id} type="button" data-active={state.usage.level === l.id} onClick={() => actions.setUsageLevel(l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={ui.menuDivider} />
            <button
              type="button"
              className={`${ui.menuItem} ${ui.menuItemDanger}`}
              onClick={() => {
                setOpen(false)
                actions.resetEverything()
              }}
            >
              <span className={styles.step}>↺</span>
              <span className={styles.text}>
                <span className={styles.title}>Reset prototype</span>
                <span className={styles.desc}>Starts over like a fresh install — welcome included</span>
              </span>
            </button>
            <p className={styles.note}>Your layout, widgets and workspaces are saved in this browser (localStorage).</p>
          </div>
        </Popover>
      )}
    </>
  )
}
