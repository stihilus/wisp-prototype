import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon'
import {
  aiModelIcon,
  badgeShieldIcon,
  chevRightIcon,
  closeIcon,
  enclaveShieldIcon,
  lockerIcon,
  profileIcon,
  removeIcon,
  shieldIcon,
} from '../../assets/icons'
import lines from '../../assets/onboarding/lines.svg'
import mascot from '../../assets/onboarding/mascot.png'
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

/** You → Wisp TEE Enclave → AI Model: each box lights up as the packet reaches it */
function PrivacyFlow() {
  return (
    <div className={styles.flow} aria-label="You, then the Wisp TEE enclave, then the AI model">
      <div className={styles.node}>
        <span className={`${styles.nodeBox} ${styles.n1}`}>
          <Icon svg={profileIcon} />
        </span>
        <span className={styles.nodeLabel}>You</span>
      </div>
      <span className={`${styles.link} ${styles.l1}`} />
      <div className={styles.node}>
        <span className={`${styles.nodeBox} ${styles.n2}`}>
          <Icon svg={enclaveShieldIcon} />
        </span>
        <span className={styles.nodeLabel}>
          Wisp TEE
          <br />
          Enclave
        </span>
      </div>
      <span className={`${styles.link} ${styles.l2}`} />
      <div className={styles.node}>
        <span className={`${styles.nodeBox} ${styles.n3}`}>
          <Icon svg={aiModelIcon} />
        </span>
        <span className={styles.nodeLabel}>AI Model</span>
      </div>
    </div>
  )
}

export function WelcomeModal() {
  const { actions } = usePrototype()
  // null = the welcome screen, 0–4 = "See how it works" steps
  const [step, setStep] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  // the mascot only belongs on the welcome screen: it ducks behind the card for the steps
  const [leftWelcome, setLeftWelcome] = useState(false)
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
    if (next !== null) setLeftWelcome(true)
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
      {/* Wisp peeks out from behind the card a moment after it opens, and stays */}
      <img
        src={mascot}
        alt=""
        className={styles.mascot}
        data-state={step !== null ? 'hidden' : leftWelcome ? 'shown' : 'intro'}
        aria-hidden
        draggable={false}
      />
      <div className={styles.card} data-mode={step === null ? 'welcome' : 'steps'} role="dialog" aria-modal="true" aria-label="Welcome to Wisp">
        <img src={lines} alt="" className={styles.lines} aria-hidden />
        <button type="button" className={styles.close} onClick={() => actions.closeWelcome('done')} aria-label="Close">
          <Icon svg={closeIcon} />
        </button>

        {step === null ? (
          <div className={styles.welcome} key="welcome" data-dir={direction}>
            <div className={styles.intro}>
              <span className={styles.badge}>
                <Icon svg={badgeShieldIcon} size={12} />
                Privacy-first AI
              </span>
              <div className={styles.titleBlock}>
                <h1 className={styles.title}>
                  Welcome to <b>Wisp</b>
                </h1>
                <p className={styles.lede}>
                  Your conversations stay yours. Wisp routes everything you ask through a{' '}
                  <span className={styles.nowrap}>
                    <button type="button" className={styles.inlineLink} onClick={() => go(0)}>
                      hardware-backed enclave
                    </button>
                    .
                  </span>{' '}
                  Your identity never reaches the AI.
                </p>
              </div>
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

            <div className={styles.actions}>
              <button type="button" className={styles.cta} onClick={finish} autoFocus>
                Start chatting
              </button>
              <div className={styles.secondaryGroup}>
                <button type="button" className={styles.secondary} onClick={() => go(0)}>
                  See how it works <span className={styles.count}>(5 steps)</span>
                  <Icon svg={chevRightIcon} />
                </button>
                <button
                  type="button"
                  className={styles.later}
                  onClick={() => {
                    actions.closeWelcome('later')
                    actions.toast('We’ll show this again the next time you open Wisp')
                  }}
                >
                  Remind me later
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.steps}>
            <div className={styles.slot}>
              <img
                key={step}
                src={introSteps[step].image}
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
