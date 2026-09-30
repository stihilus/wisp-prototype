import { Icon } from './Icon'
import { PrototypeMenu } from './PrototypeMenu'
import {
  lockerIcon,
  newsDotIcon,
  sideMenuOpenIcon,
  sparkleIcon,
  sunIcon,
  trafficIcon,
} from '../assets/icons'
import styles from './TopNav.module.css'

type TopNavProps = {
  onToggleSidebar: () => void
  onToggleTheme: () => void
  onOpenReleaseModal: () => void
  sidebarOpen: boolean
}

export function TopNav({ onToggleSidebar, onToggleTheme, onOpenReleaseModal, sidebarOpen }: TopNavProps) {
  return (
    <header className={styles.topNav}>
      <div className={styles.left}>
        <Icon svg={trafficIcon} width={52} height={12} className={styles.traffic} />
        <div className={styles.navIcons}>
          <button
            type="button"
            className={styles.iconButton}
            aria-pressed={sidebarOpen}
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <Icon svg={sideMenuOpenIcon} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Toggle theme" onClick={onToggleTheme}>
            <Icon svg={sunIcon} />
          </button>
        </div>
        <button type="button" className={styles.newsButton} onClick={onOpenReleaseModal}>
          <Icon svg={sparkleIcon} size={14} />
          <span className={styles.newsLabel}>What's new</span>
          <Icon svg={newsDotIcon} size={6} className={styles.newsDot} />
        </button>
      </div>
      <div className={styles.right}>
        <PrototypeMenu />
        <span className={styles.privateLabel}>Private</span>
        <Icon svg={lockerIcon} className={styles.privateIcon} />
      </div>
    </header>
  )
}
