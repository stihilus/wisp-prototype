import { Icon } from '../Icon'
import { UsageRing } from './UsageRing'
import { closeSmallIcon } from '../../assets/icons'
import { RESET_TIME, upgradeLabel, usageByLevel } from '../../data/usage'
import { usePrototype } from '../../store/prototype'
import styles from './Usage.module.css'

/** tab tucked under the top of the input, like the Private tab */
export function UsageBanner() {
  const { state, actions } = usePrototype()
  const { plan, level, dismissed } = state.usage
  if (level === 'normal') return null
  // × hides a banner until the next threshold; the 100% one can't be closed
  if (level !== 'reached' && dismissed === level) return null

  const usage = usageByLevel[level]
  const upgrade = upgradeLabel(plan)

  if (level === 'pace') {
    return (
      <div className={styles.banner}>
        <UsageRing pct={usage.week.pct} tone="normal" size={14} />
        <span className={styles.bannerMessage}>On pace to hit your weekly limit early</span>
        <span className={styles.bannerDetail}>
          · {usage.week.pct}% used · {usage.week.reset}
        </span>
        <span className={styles.bannerSpacer} />
        <button type="button" className={styles.bannerClose} aria-label="Hide this week" onClick={actions.dismissUsageBanner}>
          <Icon svg={closeSmallIcon} size={14} />
        </button>
      </div>
    )
  }

  const reached = level === 'reached'
  return (
    <div className={styles.banner} data-tone={level}>
      <UsageRing pct={usage.today.pct} tone={level} size={14} />
      <span className={styles.bannerMessage}>
        {reached ? "You've reached today's limit" : `You've used ${usage.today.pct}% of today's limit`}
      </span>
      <span className={styles.bannerDetail}>· {reached ? `Resets at ${RESET_TIME}` : usage.today.reset}</span>
      <span className={styles.bannerSpacer} />
      {!reached && (
        <button type="button" className={styles.bannerLink} onClick={actions.openUsage}>
          View usage
        </button>
      )}
      {upgrade && (
        <button type="button" className={`${styles.bannerLink} ${styles.bannerUpgrade}`} onClick={actions.upgradePlan}>
          {upgrade}
        </button>
      )}
      {!reached && (
        <button type="button" className={styles.bannerClose} aria-label="Hide" onClick={actions.dismissUsageBanner}>
          <Icon svg={closeSmallIcon} size={14} />
        </button>
      )}
    </div>
  )
}
