import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { ConnectorsDropdown } from './ConnectorsDropdown'
import {
  connectorIcon,
  ellipse149Icon,
  closeSmallIcon,
  feedIcon,
  feedbackFilledIcon,
  filesIcon,
  gmailMarkIcon,
  navItemIcon,
  skillsIcon,
} from '../assets/icons'
import { logoGranola, logoLinear } from '../assets/logos'
import { usePrototype } from '../store/prototype'
import styles from './RightSideNav.module.css'

type PanelKey = 'files' | 'transcript' | 'skills' | 'connectors'

type RightSideNavProps = {
  activePanel: PanelKey | null
  onTogglePanel: (panel: PanelKey) => void
  onClosePanel: () => void
  feedBadge: number
  onOpenFeed: () => void
}

export function RightSideNav({ activePanel, onTogglePanel, onClosePanel, feedBadge, onOpenFeed }: RightSideNavProps) {
  const connectorWrapRef = useRef<HTMLDivElement>(null)

  return (
    <nav className={styles.nav}>
      <div className={styles.feedSlot}>
        <button
          type="button"
          className={styles.feedButton}
          data-tooltip={feedBadge ? `Updates · ${feedBadge} new` : 'Updates'}
          aria-label="Updates"
          onClick={onOpenFeed}
        >
          <Icon svg={feedIcon} size={16} />
          {feedBadge > 0 && <span className={styles.feedBadge}>{feedBadge}</span>}
        </button>
      </div>

      <div className={styles.rail}>
        <button
          type="button"
          className={styles.pillButton}
          data-tooltip="Files"
          onClick={() => onTogglePanel('files')}
          aria-pressed={activePanel === 'files'}
        >
          <Icon svg={filesIcon} size={20} />
        </button>

        <button
          type="button"
          className={styles.pillButton}
          data-tooltip="Transcript"
          data-tour="transcript"
          onClick={() => onTogglePanel('transcript')}
          aria-pressed={activePanel === 'transcript'}
        >
          <Icon svg={navItemIcon} size={20} />
        </button>

        <button
          type="button"
          className={styles.pillButton}
          data-tooltip="Skills"
          onClick={() => onTogglePanel('skills')}
          aria-pressed={activePanel === 'skills'}
        >
          <Icon svg={skillsIcon} size={20} />
        </button>

        <div className={styles.connectorGroup} ref={connectorWrapRef}>
          <button
            type="button"
            className={styles.pillButton}
            data-tooltip="Connectors"
            data-tour="connectors"
            onClick={() => onTogglePanel('connectors')}
            aria-pressed={activePanel === 'connectors'}
          >
            <Icon svg={connectorIcon} size={20} />
            <span className={styles.badge}>
              <Icon svg={ellipse149Icon} size={6} />
            </span>
          </button>

          <div className={styles.appStack}>
            <span className={styles.appChip}>
              <Icon svg={gmailMarkIcon} size={9.8} />
            </span>
            <span className={styles.appChip}>
              <img src={logoLinear} alt="" className={styles.appChipImg} />
            </span>
            <span className={styles.appChip}>
              <img src={logoGranola} alt="" className={styles.appChipImg} />
            </span>
          </div>

          {activePanel === 'connectors' && (
            <ConnectorsDropdown onClose={onClosePanel} />
          )}
        </div>
      </div>

      <ReportButton />
    </nav>
  )
}

/** "Leave a report" — can be nudged: a few soft pulses and a hint that pops out
 *  and closes itself after 5s (or right away with its X). */
function ReportButton() {
  const { reportNudge } = usePrototype()
  const [pulseEnded, setPulseEnded] = useState(0)
  const [hintGone, setHintGone] = useState(0)
  const [closing, setClosing] = useState(0)
  const pulsing = reportNudge > 0 && pulseEnded !== reportNudge
  const hintVisible = reportNudge > 0 && hintGone !== reportNudge

  return (
    <div className={styles.reportWrap}>
      <button
        // remount on every nudge so the pulse restarts even if one is still running
        key={reportNudge}
        type="button"
        className={styles.feedbackButton}
        aria-label="Leave a report"
        data-tour="feedback"
        data-nudge={pulsing || undefined}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setPulseEnded(reportNudge)
        }}
        onClick={() => {
          setPulseEnded(reportNudge)
          setClosing(reportNudge)
        }}
      >
        <Icon svg={feedbackFilledIcon} />
      </button>
      {hintVisible && (
        <div
          key={reportNudge}
          className={styles.reportHint}
          data-closing={closing === reportNudge || undefined}
          role="status"
          // the hint's own animation pops it in, holds it, and fades it out at 5s
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) setHintGone(reportNudge)
          }}
        >
          <span className={styles.reportHintText}>
            <span className={styles.reportHintTitle}>Something not working?</span>
            <span className={styles.reportHintSub}>Leave a report — it goes straight to the team.</span>
          </span>
          <button type="button" className={styles.reportHintClose} onClick={() => setClosing(reportNudge)} aria-label="Dismiss">
            <Icon svg={closeSmallIcon} size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
