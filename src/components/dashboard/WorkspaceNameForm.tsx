import { useState } from 'react'
import ui from '../ui/controls.module.css'
import styles from './WorkspaceNameForm.module.css'

type Props = {
  initial?: string
  cta: string
  onSubmit: (name: string) => void
  onCancel: () => void
}

export function WorkspaceNameForm({ initial = '', cta, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial)
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSubmit(name)
      }}
    >
      <input
        className={ui.input}
        autoFocus
        value={name}
        maxLength={24}
        placeholder="e.g. Clients"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      />
      <button type="submit" className={`${ui.btn} ${ui.btnInvert}`} disabled={!name.trim()}>
        {cta}
      </button>
    </form>
  )
}
