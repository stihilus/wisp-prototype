import { useRef } from 'react'
import { Icon } from './Icon'
import { ConnectorsDropdown } from './ConnectorsDropdown'
import {
  connectorIcon,
  ellipse149Icon,
  feedIcon,
  feedbackFilledIcon,
  filesIcon,
  gmailMarkIcon,
  navItemIcon,
  skillsIcon,
} from '../assets/icons'
import { logoGranola, logoLinear } from '../assets/logos'
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

      <button type="button" className={styles.feedbackButton} aria-label="Send feedback">
        <Icon svg={feedbackFilledIcon} />
      </button>
    </nav>
  )
}
