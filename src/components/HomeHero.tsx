import { ChatInput } from './ChatInput'
import { TrustBar } from './TrustBar'
import styles from './HomeHero.module.css'

type HomeHeroProps = {
  onSend: (message: string) => void
  guidedModelTrigger?: number
  autoSelectModelId?: string
}

export function HomeHero({ onSend, guidedModelTrigger, autoSelectModelId }: HomeHeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.titleBlock}>
        <p className={styles.greeting}>Good morning</p>
        <h1 className={styles.headline}>How can I help you today?</h1>
      </div>

      <div className={styles.inputBlock}>
        <ChatInput onSend={onSend} guidedModelTrigger={guidedModelTrigger} autoSelectModelId={autoSelectModelId} />
      </div>

      <div className={styles.trustBarWrap}>
        <TrustBar />
      </div>
    </div>
  )
}
