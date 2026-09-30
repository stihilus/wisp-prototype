import { Icon } from './Icon'
import { lockerIcon, removeIcon, shieldIcon } from '../assets/icons'
import styles from './TrustBar.module.css'

export function TrustBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.item}>
        <Icon svg={lockerIcon} size={12} />
        Encrypted
      </span>
      <span className={styles.pipe}>|</span>
      <span className={styles.item}>
        <Icon svg={shieldIcon} size={12} />
        Never used for training
      </span>
      <span className={styles.pipe}>|</span>
      <span className={styles.item}>
        <Icon svg={removeIcon} size={12} />
        True deletion
      </span>
    </div>
  )
}
