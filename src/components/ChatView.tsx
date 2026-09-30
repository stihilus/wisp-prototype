import { useEffect, useRef } from 'react'
import { ChatInput } from './ChatInput'
import { TrustBar } from './TrustBar'
import { Icon } from './Icon'
import { ToolLogo } from './dashboard/ToolLogo'
import { downAltIcon, globeIcon, lockerIcon, shieldIcon } from '../assets/icons'
import type { ChatMessage } from '../data/messages'
import styles from './ChatView.module.css'

type ChatViewProps = {
  messages: ChatMessage[]
  onSend: (message: string) => void
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === 'context') {
    const kinds = Array.from(new Set(message.kinds)).slice(0, 4)
    return (
      <div className={styles.contextCard}>
        <span className={styles.contextLogos}>
          {kinds.map((kind) => (
            <ToolLogo key={kind} kind={kind} size={24} className={styles.contextLogo} />
          ))}
        </span>
        <span className={styles.contextText}>
          <span className={styles.contextTitle}>{message.title}</span>
          <span className={styles.contextDetail}>{message.detail}</span>
        </span>
        <span className={styles.contextBadge}>
          <Icon svg={lockerIcon} size={10} />
          Added as context
        </span>
      </div>
    )
  }

  if (message.role === 'tool') {
    return (
      <div className={styles.toolCard}>
        <div className={styles.toolCardLeft}>
          <Icon svg={globeIcon} />
          <p className={styles.toolCardText}>
            {message.label} · <span>{message.url}</span>
          </p>
          <Icon svg={shieldIcon} />
        </div>
        <Icon svg={downAltIcon} />
      </div>
    )
  }

  if (message.role === 'user') {
    return <div className={styles.userBubble}>{message.text}</div>
  }

  return <div className={styles.wispBubble}>{message.text}</div>
}

export function ChatView({ messages, onSend }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className={styles.chatView}>
      <div className={`${styles.scroll} thin-scroll`} ref={scrollRef}>
        <div className={styles.messages}>
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </div>
      </div>

      <div className={styles.dock}>
        <div className={styles.dockInner}>
          <ChatInput onSend={onSend} showContextUsage />
          <TrustBar />
        </div>
      </div>
    </div>
  )
}
