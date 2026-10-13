import { Icon } from './Icon'
import { chevSmallIcon, closeSmallIcon } from '../assets/icons'
import styles from './ChatOutline.module.css'

export type OutlineItem = { id: string; kind: 'heading' | 'mark'; text: string }
export type OutlineGroup = { id: string; prompt: string; items: OutlineItem[] }

type Props = {
  groups: OutlineGroup[]
  activeId: string | null
  collapsed: Set<string>
  variant: 'docked' | 'popover'
  showTip: boolean
  onToggle: (groupId: string) => void
  onJump: (id: string) => void
  onUnmark: (blockId: string) => void
}

/**
 * The chat's "table of contents": each of the user's prompts, and under it the
 * section headings Wisp answered with, plus any paragraph the user marked.
 */
export function ChatOutline({ groups, activeId, collapsed, variant, showTip, onToggle, onJump, onUnmark }: Props) {
  return (
    <nav className={styles.outline} data-variant={variant} aria-label="Chat outline">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.id)
        const activeInside = group.items.some((i) => i.id === activeId)
        return (
          <section key={group.id} className={styles.group}>
            <div className={styles.groupHead}>
              <button
                type="button"
                className={styles.prompt}
                data-active={activeId === group.id || (isCollapsed && activeInside)}
                onClick={() => onJump(group.id)}
                title={group.prompt}
              >
                {group.prompt}
              </button>
              {group.items.length > 0 && (
                <button
                  type="button"
                  className={styles.chev}
                  aria-expanded={!isCollapsed}
                  aria-label={isCollapsed ? 'Show sections' : 'Hide sections'}
                  onClick={() => onToggle(group.id)}
                >
                  <Icon svg={chevSmallIcon} size={14} />
                </button>
              )}
            </div>

            {group.items.length > 0 && (
              <div className={styles.itemsWrap} data-collapsed={isCollapsed}>
                <ul className={styles.items}>
                  {group.items.map((item) => (
                    <li key={item.id} className={styles.row} data-kind={item.kind}>
                      <button
                        type="button"
                        className={styles.item}
                        data-active={activeId === item.id}
                        onClick={() => onJump(item.id)}
                        tabIndex={isCollapsed ? -1 : 0}
                      >
                        <span className={styles.itemText}>{item.text}</span>
                      </button>
                      {item.kind === 'mark' && (
                        <button
                          type="button"
                          className={styles.unmark}
                          onClick={() => onUnmark(item.id)}
                          aria-label="Remove mark"
                          title="Remove mark"
                          tabIndex={isCollapsed ? -1 : 0}
                        >
                          <Icon svg={closeSmallIcon} size={10} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )
      })}

      {showTip && <p className={styles.tip}>Right-click any paragraph to mark it — it shows up here.</p>}
    </nav>
  )
}
