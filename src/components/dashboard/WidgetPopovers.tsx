import { useState } from 'react'
import { Icon } from '../Icon'
import { Popover } from '../ui/Popover'
import { checkIcon, closeSmallIcon, refreshIcon, slidersIcon, sparkleBrandIcon } from '../../assets/icons'
import { presets, presetFor, tools, widgetContent, isTool, type Widget } from '../../data/dashboard'
import ui from '../ui/controls.module.css'
import styles from './WidgetPopovers.module.css'

type Anchor = HTMLElement | null

/* ----------------------------------------------------------- 07 · menu */

type WidgetMenuProps = {
  anchor: Anchor
  widget: Widget
  workspaceName: string
  onClose: () => void
  onRefresh: () => void
  onAutoRefresh: () => void
  onChooseScope?: () => void
  onChange: () => void
  onAsk: () => void
  onRemove: () => void
}

export function WidgetMenu({ anchor, widget, workspaceName, onClose, onRefresh, onAutoRefresh, onChooseScope, onChange, onAsk, onRemove }: WidgetMenuProps) {
  const scope = isTool(widget.kind) ? tools[widget.kind].scope : undefined
  const askLabel = widget.kind === 'telegram' ? 'Ask Wisp about these chats' : widget.kind === 'gmail' ? 'Ask Wisp about these emails' : 'Ask Wisp about this'

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-end" offset={10} className={styles.menuPopover}>
      <div className={ui.menu} role="menu">
        <button type="button" className={ui.menuItem} onClick={onRefresh} role="menuitem">
          <Icon svg={refreshIcon} size={14} />
          <span className={ui.menuLabel}>Refresh now</span>
        </button>
        <button type="button" className={ui.menuItem} onClick={onAutoRefresh} role="menuitem">
          <Icon svg={refreshIcon} size={14} className={styles.brandIcon} />
          <span className={ui.menuLabel}>Auto-refresh every 30 min</span>
          <span className={ui.badgeBrand}>Starter</span>
          <span className={ui.switch} data-on="false" />
        </button>
        {scope && onChooseScope && (
          <button type="button" className={ui.menuItem} onClick={onChooseScope} role="menuitem">
            <Icon svg={slidersIcon} size={14} />
            <span className={ui.menuLabel}>Choose {scope.unit === 'chats' ? 'chats' : 'labels'}…</span>
          </button>
        )}
        <button type="button" className={ui.menuItem} onClick={onChange} role="menuitem">
          <Icon svg={sparkleBrandIcon} size={14} />
          <span className={ui.menuLabel}>Change what it shows</span>
        </button>
        <button type="button" className={ui.menuItem} onClick={onAsk} role="menuitem">
          <Icon svg={sparkleBrandIcon} size={14} />
          <span className={ui.menuLabel}>{askLabel}</span>
        </button>
        <div className={ui.menuDivider} />
        <button type="button" className={`${ui.menuItem} ${ui.menuItemDanger}`} onClick={onRemove} role="menuitem">
          <Icon svg={closeSmallIcon} size={14} />
          <span className={ui.menuLabel}>Remove from {workspaceName}</span>
        </button>
      </div>
    </Popover>
  )
}

/* --------------------------------------------- 08 · change what it shows */

type ChangeProps = {
  anchor: Anchor
  widget: Widget
  onClose: () => void
  onSave: (preset: string, prompt: string | undefined) => void
}

export function ChangeWidgetPopover({ anchor, widget, onClose, onSave }: ChangeProps) {
  const current = presetFor(widget.kind, widget.preset)
  const [selected, setSelected] = useState(current.id)
  const [prompt, setPrompt] = useState(widget.prompt ?? current.prompt)
  const options = presets[widget.kind]
  const preview = widgetContent({ ...widget, preset: selected })

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-end" offset={10} className={styles.changePopover}>
      <div className={styles.changeBody}>
        <div className={styles.titleBlock}>
          <h3 className={styles.title}>Change what this widget shows</h3>
          <p className={styles.subtitle}>Say it in plain words. Start from one of these:</p>
        </div>

        <div className={styles.chips}>
          {options.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.chip}
              data-selected={p.id === selected}
              onClick={() => {
                setSelected(p.id)
                setPrompt(p.prompt)
              }}
            >
              {p.id === selected && <Icon svg={checkIcon} size={12} />}
              {p.chip}
            </button>
          ))}
        </div>

        <textarea
          className={styles.prompt}
          value={prompt}
          rows={3}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSave(selected, prompt)
          }}
        />

        <p className={styles.hint}>
          <Icon svg={sparkleBrandIcon} size={10} className={styles.brandIcon} />
          Wisp will title it “{preview.headline}” and check it on every refresh.
        </p>

        <div className={styles.actions}>
          <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnInvert}`} onClick={() => onSave(selected, prompt)} disabled={!prompt.trim()}>
            Save
          </button>
        </div>
      </div>
    </Popover>
  )
}

/* ------------------------------------------------ 09 · auto-refresh info */

type AutoRefreshProps = {
  anchor: Anchor
  onClose: () => void
  onSeePlans: () => void
  placement?: 'bottom-end' | 'bottom-start'
}

export function AutoRefreshPopover({ anchor, onClose, onSeePlans, placement = 'bottom-end' }: AutoRefreshProps) {
  return (
    <Popover anchor={anchor} onClose={onClose} placement={placement} offset={10} className={styles.refreshPopover}>
      <div className={styles.changeBody}>
        <div className={styles.refreshTitle}>
          <Icon svg={sparkleBrandIcon} size={14} className={styles.brandIcon} />
          <h3 className={styles.title}>Keep your home fresh</h3>
        </div>
        <p className={styles.body}>
          On Free, widgets update when you press <Icon svg={refreshIcon} size={12} className={styles.inlineIcon} />. On Starter and above,
          Wisp checks every 30 minutes and only lights a widget up when something actually changed.
        </p>
        <div className={styles.plans}>
          <div className={styles.planRow}>
            <span>Free</span>
            <span className={styles.planValue}>Refresh by hand</span>
          </div>
          <div className={styles.planRow}>
            <span>Starter · $20/mo</span>
            <span className={styles.planValue}>Every 30 min, quietly</span>
          </div>
        </div>
        <div className={styles.actionsStart}>
          <button type="button" className={`${ui.btn} ${ui.btnInvert}`} onClick={onSeePlans}>
            See plans
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </Popover>
  )
}
