import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import { addIcon, circleCheckIcon, gmailMarkIcon, searchIcon, settingsIcon } from '../assets/icons'
import { logoGoogleCalendar, logoGranola, logoLinear, logoNotion } from '../assets/logos'
import styles from './ConnectorsDropdown.module.css'

type Connector = {
  id: string
  name: string
  logo: ReactNode
}

const connectors: Connector[] = [
  { id: 'gmail', name: 'Gmail', logo: <Icon svg={gmailMarkIcon} size={14.7} /> },
  { id: 'notion', name: 'Notion', logo: <img src={logoNotion} alt="" className={styles.logoImg} /> },
  { id: 'granola', name: 'Granola', logo: <img src={logoGranola} alt="" className={styles.logoImg} /> },
  { id: 'linear', name: 'Linear', logo: <img src={logoLinear} alt="" className={styles.logoImg} /> },
  { id: 'google-calendar', name: 'Google Calendar', logo: <img src={logoGoogleCalendar} alt="" className={styles.logoImg} /> },
]

const initiallyConnected = new Set(['gmail', 'granola', 'linear'])

type ConnectorsDropdownProps = {
  onClose: () => void
}

export function ConnectorsDropdown({ onClose }: ConnectorsDropdownProps) {
  const [connected, setConnected] = useState(initiallyConnected)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const toggleConnected = (id: string) => {
    setConnected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = connectors.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className={styles.dropdown} ref={ref} role="menu">
      <div className={styles.searchRow}>
        <Icon svg={searchIcon} className={styles.muted} />
        <input
          className={styles.searchInput}
          placeholder="Search connectors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className={styles.divider} />

      <div className={styles.list}>
        {filtered.map((connector) => {
          const isConnected = connected.has(connector.id)
          return (
            <button
              key={connector.id}
              type="button"
              className={styles.row}
              onClick={() => toggleConnected(connector.id)}
            >
              <span className={styles.service}>
                <span className={styles.logoChip}>{connector.logo}</span>
                <span className={styles.serviceName}>{connector.name}</span>
              </span>
              {isConnected ? (
                <span className={styles.status}>
                  <Icon svg={circleCheckIcon} size={14} />
                  Connected
                </span>
              ) : (
                <span className={styles.connectLabel}>Connect</span>
              )}
            </button>
          )
        })}

        <div className={styles.divider} />
        <button type="button" className={styles.actionRow}>
          <span className={styles.actionIcon}>
            <Icon svg={addIcon} />
          </span>
          Add custom Connector
        </button>
        <div className={styles.divider} />
        <button type="button" className={styles.actionRow}>
          <span className={styles.actionIcon}>
            <Icon svg={settingsIcon} />
          </span>
          Go to settings
        </button>
      </div>
    </div>
  )
}
