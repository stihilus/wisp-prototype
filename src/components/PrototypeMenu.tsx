import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { Popover } from './ui/Popover'
import { chevSmallIcon } from '../assets/icons'
import { usePrototype, type Scenario } from '../store/prototype'
import ui from './ui/controls.module.css'
import styles from './PrototypeMenu.module.css'

const scenarios: { id: Scenario; title: string; desc: string }[] = [
  { id: 'empty', title: 'Empty — first run', desc: 'Suggestions only, nothing connected' },
  { id: 'few', title: 'A couple connected', desc: 'Telegram + Gmail, the rest in one line' },
  { id: 'all', title: 'Everything connected', desc: 'Full dashboard, charts included' },
]

// Not part of the product — a small control for whoever is demoing the
// prototype, so they can jump between the Figma states without clicking
// through every flow.
export function PrototypeMenu() {
  const { activeWorkspace, actions } = usePrototype()
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
            <span className={`${ui.sectionLabel} ${styles.label}`}>Jump {activeWorkspace.name} to</span>
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
                <span className={styles.desc}>Clears everything saved in this browser</span>
              </span>
            </button>
            <p className={styles.note}>Your layout, widgets and workspaces are saved in this browser (localStorage).</p>
          </div>
        </Popover>
      )}
    </>
  )
}
