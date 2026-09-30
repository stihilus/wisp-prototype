import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Icon } from './Icon'
import { ModelPicker } from './ModelPicker'
import { addFolderIcon, addIcon, brainIcon, ellipse6Icon, micIcon } from '../assets/icons'
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

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
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
      <div className={styles.protectedTab}>
        <span>Private</span>
        <Icon svg={ellipse6Icon} size={6} className={styles.dot} />
      </div>

      <div className={styles.card}>
        <div className={styles.inputRow}>
          <textarea
            className={styles.textarea}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button type="submit" className={styles.micButton} aria-label="Send / voice input">
            <Icon svg={micIcon} />
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <button type="button" className={styles.circleButton} aria-label="Add attachment">
              <Icon svg={addIcon} />
            </button>
            <button type="button" className={styles.pillButton}>
              <Icon svg={addFolderIcon} />
              Project
            </button>
          </div>
          <div className={styles.toolbarGroup}>
            {showContextUsage && <span className={styles.contextUsage}>Context: 72K / 1M</span>}
            <ModelPicker guidedTrigger={guidedModelTrigger} autoSelectModelId={autoSelectModelId} />
            <button
              type="button"
              className={styles.pillButton}
              data-active={thinking}
              onClick={() => setThinking((v) => !v)}
            >
              <Icon svg={brainIcon} />
              Thinking
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
