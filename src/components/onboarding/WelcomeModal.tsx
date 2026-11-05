import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import { closeIcon, coworkIcon, lockerIcon, profileIcon, removeIcon, shieldIcon } from '../../assets/icons'
import lines from '../../assets/onboarding/lines.svg'
import { introSteps, type RichText } from '../../data/onboarding'
import { usePrototype } from '../../store/prototype'
import styles from './WelcomeModal.module.css'

function Rich({ text }: { text: RichText }) {
  return (
    <>
      {text.map((part, i) => (typeof part === 'string' ? <span key={i}>{part}</span> : <b key={i}>{part.b}</b>))}
    </>
  )
}

/**
 * You → [sealed hardware: Wisp Anonymizer] → AI. A packet leaves your prompt,
 * the Anonymizer lights up as it strips who you are, then only the question
 * travels on to the AI.
 */
function PrivacyFlow() {
  return (
    <div
      className={styles.flow}
      role="img"
      aria-label="Your prompt goes through the Wisp Anonymizer inside sealed hardware, so the AI sees only the question"
    >
      <span className={styles.sealed} />
      <span className={styles.glow} />
      <span className={styles.sealedLabel}>
        <Icon svg={lockerIcon} size={11} />
        Sealed hardware
      </span>

      <span className={styles.wireIn} />
      <span className={styles.lockBadge}>
        <Icon svg={lockerIcon} size={10} />
      </span>
      <span className={styles.wireOut} />
      <span className={styles.packetIn} />
      <span className={styles.packetOut} />

      <span className={`${styles.tile} ${styles.tileYou}`}>
        <Icon svg={profileIcon} size={20} />
      </span>
      <span className={`${styles.tile} ${styles.tileWisp}`}>
        <Icon svg={shieldIcon} size={20} />
      </span>
      <span className={`${styles.tile} ${styles.tileAi}`}>
        <Icon svg={coworkIcon} size={20} />
      </span>

      <span className={`${styles.label} ${styles.labelYou}`}>
        <span className={styles.labelName}>You</span>
        <span className={styles.labelSub}>your prompt</span>
      </span>
      <span className={`${styles.label} ${styles.labelWisp}`}>
        <span className={styles.labelName}>Wisp Anonymizer</span>
        <span className={styles.labelSub}>removes who you are</span>
      </span>
      <span className={`${styles.label} ${styles.labelAi}`}>
        <span className={styles.labelName}>AI</span>
        <span className={styles.labelSub}>sees only the question</span>
      </span>
    </div>
  )
}

export function WelcomeModal() {
  const { actions } = usePrototype()
  // null = the welcome screen, 0–4 = the "How it works" steps
  const [step, setStep] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const stepRef = useRef(step)
  stepRef.current = step

  const last = introSteps.length - 1

  const finish = () => {
    actions.closeWelcome('done')
    // land the cursor in the chat input, ready to type
    window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('form textarea')?.focus(), 50)
  }

  const go = (next: number | null) => {
    setDirection(next === null || (stepRef.current !== null && next < stepRef.current) ? -1 : 1)
    setStep(next)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stepRef.current
      if (e.key === 'Escape') actions.closeWelcome('done')
      if (s === null) return
      if (e.key === 'ArrowRight' && s < introSteps.length - 1) go(s + 1)
      if (e.key === 'ArrowLeft') go(s === 0 ? null : s - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div className={styles.backdrop}>
      <div className={styles.stage} data-mode={step === null ? 'welcome' : 'steps'}>
      <div className={styles.card} data-mode={step === null ? 'welcome' : 'steps'} role="dialog" aria-modal="true" aria-label="Welcome to Wisp">
        <img src={lines} alt="" className={styles.lines} aria-hidden />
        <button type="button" className={styles.close} onClick={() => actions.closeWelcome('done')} aria-label="Close">
          <Icon svg={closeIcon} />
        </button>

        {step === null ? (
          <div className={styles.welcome} key="welcome" data-dir={direction}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>
                Welcome to <b>Wisp</b>
              </h1>
              <p className={styles.lede}>
                Private AI for chats and work you can’t afford to leak.
                <br />
                Let nobody read, store or train on your prompts.
              </p>
            </div>

            <div className={styles.proof}>
              <PrivacyFlow />
              <div className={styles.trust}>
                <span>
                  <Icon svg={lockerIcon} size={12} />
                  Encrypted
                </span>
                <span className={styles.pipe}>|</span>
                <span>
                  <Icon svg={shieldIcon} size={12} />
                  Never used for training
                </span>
                <span className={styles.pipe}>|</span>
                <span>
                  <Icon svg={removeIcon} size={12} />
                  True deletion
                </span>
              </div>
            </div>

            <button type="button" className={styles.cta} onClick={() => go(0)} autoFocus>
              How it works
              <span className={styles.chev} aria-hidden>
                ›
              </span>
            </button>
          </div>
        ) : (
          <div className={styles.steps}>
            <div className={styles.slot}>
              <img
                key={step}
                src={introSteps[step].image}
                srcSet={`${introSteps[step].image} 2x`}
                alt=""
                className={styles.illustration}
                data-dir={direction}
                draggable={false}
              />
            </div>

            <div className={styles.stepText} key={`text-${step}`} data-dir={direction}>
              <div className={styles.dots} role="tablist" aria-label="Steps">
                {introSteps.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    role="tab"
                    aria-selected={i === step}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    className={styles.dot}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
              <h2 className={styles.stepTitle}>{introSteps[step].title}</h2>
              <p className={styles.stepBody}>
                <Rich text={introSteps[step].body} />
              </p>
            </div>

            <div className={styles.stepActions}>
              <div className={styles.stepButtons}>
                <button type="button" className={styles.back} onClick={() => go(step === 0 ? null : step - 1)}>
                  Back
                </button>
                <button type="button" className={styles.cta} onClick={() => (step === last ? finish() : go(step + 1))}>
                  {step === last ? 'Start your first chat' : 'Continue'}
                </button>
              </div>
              <button type="button" className={styles.skip} onClick={finish} data-hidden={step === last || undefined}>
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>,
    document.body,
  )
}
