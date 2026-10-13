import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { Popover } from '../ui/Popover'
import { UsageRing } from './UsageRing'
import { chevRightIcon } from '../../assets/icons'
import { plans, pricePhrase, toneOf, usageByLevel, type Meter } from '../../data/usage'
import { usePrototype } from '../../store/prototype'
import styles from './Usage.module.css'

function MeterRow({ meter }: { meter: Meter }) {
  const tone = toneOf(meter.pct)
  return (
    <div className={styles.meter}>
      <div className={styles.meterRow}>
        <div className={styles.meterLabel}>
          <span className={styles.meterTitle}>{meter.label}</span>
          <span className={styles.meterReset}>{meter.reset}</span>
        </div>
        <span className={styles.meterValue} data-tone={tone}>
          {meter.pct}% used
        </span>
      </div>
      <div className={styles.track}>
        <div className={styles.bar} data-tone={tone} style={{ width: `${Math.min(meter.pct, 100)}%` }} />
      </div>
    </div>
  )
}

/** click on the ring — plan + the same three meters as Settings › Usage */
function UsagePopover() {
  const { state, actions } = usePrototype()
  const { plan, level } = state.usage
  const usage = usageByLevel[level]
  const next = plans[plan].next
  const free = plan === 'free'
  // paid plans get a card for the next plan once today passes 70%
  const upsell = !free && next && toneOf(usage.today.pct) !== 'normal'

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.planText}>
          <span className={styles.planTitle}>{plans[plan].name}</span>
          <span className={styles.planSub}>{free ? 'Same privacy on every plan' : plans[plan].price}</span>
        </div>
        {free ? (
          <button type="button" className={`${styles.pillBtn} ${styles.pillBtnInvert}`} onClick={actions.upgradePlan}>
            Upgrade
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.pillBtn} ${styles.pillBtnOutline}`}
            onClick={() => actions.toast('Plans & billing live in Settings › Billing — not part of this prototype')}
          >
            Change
          </button>
        )}
      </div>
      <div className={styles.rule} />
      <MeterRow meter={usage.today} />
      <MeterRow meter={usage.week} />
      <MeterRow meter={usage.billing} />
      {upsell && next && (
        <div className={styles.upsell}>
          <span className={styles.upsellTitle}>{usage.today.pct >= 100 ? "You've hit today's limit" : 'Running low today'}</span>
          <span className={styles.upsellBody}>
            {plans[next].name} gives you {plans[next].boost} the {plans[plan].name} limits, for {pricePhrase(next)}.
          </span>
          <button type="button" className={`${styles.pillBtn} ${styles.pillBtnCta}`} onClick={actions.upgradePlan}>
            Upgrade to {plans[next].name}
          </button>
        </div>
      )}
      <div className={styles.rule} />
      <button
        type="button"
        className={styles.details}
        onClick={() => actions.toast('Settings › Usage is not part of this prototype yet')}
      >
        Usage details
        <Icon svg={chevRightIcon} size={14} />
      </button>
    </div>
  )
}

/** hover on the ring — today's % and reset, plus this week. Nothing to click */
function UsageTooltip({ anchor }: { anchor: HTMLElement }) {
  const { state } = usePrototype()
  const { plan, level } = state.usage
  const usage = usageByLevel[level]
  const next = plans[plan].next
  const r = anchor.getBoundingClientRect()
  // from 70% one more line points at the click popover
  const hint =
    toneOf(usage.today.pct) !== 'normal' && next
      ? plan === 'free'
        ? 'Need more? Click to upgrade'
        : `Need more? Click for ${plans[next].name}`
      : null

  return createPortal(
    <div className={styles.tooltip} style={{ top: r.bottom + 7, left: r.left + r.width / 2 }} role="tooltip">
      <span className={styles.tooltipTitle}>Today · {usage.today.pct}% used</span>
      <span className={styles.tooltipLine}>{usage.today.reset}</span>
      <span className={styles.tooltipLine}>
        This week · {usage.week.pct}% · {usage.week.reset}
      </span>
      {hint && <span className={styles.tooltipHint}>{hint}</span>}
    </div>,
    document.body,
  )
}

/** plan pill + usage ring, left of "Private" in the top bar */
export function UsageControls() {
  const { state, actions, usageOpen } = usePrototype()
  const { plan, level } = state.usage
  const today = usageByLevel[level].today
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [hover, setHover] = useState(false)

  return (
    <div className={styles.controls}>
      {/* paid plans drop the pill — only the ring stays */}
      {plan === 'free' && (
        <div className={styles.planPill}>
          <span className={styles.planName}>Free plan</span>
          <span className={styles.planDivider} />
          <button type="button" className={styles.planUpgrade} onClick={actions.upgradePlan}>
            Upgrade
          </button>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className={styles.usageButton}
        data-open={usageOpen}
        aria-label={`Usage: ${today.pct}% of today's limit`}
        aria-expanded={usageOpen}
        onClick={() => {
          setHover(false)
          actions.toggleUsage()
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <UsageRing pct={today.pct} tone={toneOf(today.pct)} />
      </button>
      {hover && !usageOpen && buttonRef.current && <UsageTooltip anchor={buttonRef.current} />}
      {usageOpen && (
        <Popover anchor={buttonRef.current} onClose={actions.closeUsage} placement="bottom-end" offset={7} className={styles.popover}>
          <UsagePopover />
        </Popover>
      )}
    </div>
  )
}
