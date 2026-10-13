import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Icon } from './Icon'
import { ModelPicker } from './ModelPicker'
import { UsageBanner } from './usage/UsageBanner'
import { addFolderIcon, addIcon, brainIcon, ellipse6Icon, micIcon } from '../assets/icons'
import { RESET_TIME } from '../data/usage'
import { usePrototype } from '../store/prototype'
import styles from './ChatInput.module.css'

type ChatInputProps = {
  onSend: (message: string) => void
  placeholder?: string
  guidedModelTrigger?: number
  autoSelectModelId?: string
  showContextUsage?: boolean
}

export function ChatInput({
  onSend,
  placeholder = 'How can I help you today?',
  guidedModelTrigger = 0,
  autoSelectModelId,
  showContextUsage = false,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [thinking, setThinking] = useState(false)
  const { state } = usePrototype()
  // at 100% of today's limit history stays readable, only sending is blocked
  const paused = state.usage.level === 'reached'

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || paused) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.tabs}>
        <UsageBanner />
        <div className={styles.protectedTab}>
          <span>Private</span>
          <Icon svg={ellipse6Icon} size={6} className={styles.dot} />
        </div>
      </div>

      <div className={styles.card} data-paused={paused}>
        <div className={styles.inputRow}>
          <textarea
            className={styles.textarea}
            placeholder={paused ? `Sending is paused until ${RESET_TIME}` : placeholder}
            disabled={paused}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button type="submit" className={styles.micButton} aria-label="Send / voice input" disabled={paused}>
            <Icon svg={micIcon} />
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <button type="button" className={styles.circleButton} aria-label="Add attachment">
              <Icon svg={addIcon} />
            </button>
            <button type="button" className={styles.pillButton} data-tour="project">
              <Icon svg={addFolderIcon} />
              Project
            </button>
          </div>
          <div className={styles.toolbarGroup}>
            {showContextUsage && <span className={styles.contextUsage}>Context: 72K / 1M</span>}
            <ModelPicker guidedTrigger={guidedModelTrigger} autoSelectModelId={autoSelectModelId} />
            <button
              type="button"
              className={styles.thinking}
              data-on={thinking}
              aria-pressed={thinking}
              data-tour="thinking"
              onClick={() => setThinking((v) => !v)}
            >
              <Icon svg={brainIcon} />
              Thinking: {thinking ? 'on' : 'off'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
