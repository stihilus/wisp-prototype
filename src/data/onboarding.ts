// First-time experience content.
// 1st launch: the Welcome modal (+ optional 5-step "See how it works").
// 2nd launch: feature tips anchored to the real UI, one after another.

import step1 from '../assets/onboarding/step1.png'
import step2 from '../assets/onboarding/step2.png'
import step3 from '../assets/onboarding/step3.png'
import step4 from '../assets/onboarding/step4.png'
import step5 from '../assets/onboarding/step5.png'

/** text parts: plain strings, or { b } for the emphasised bits */
export type RichText = (string | { b: string })[]

export type IntroStep = { image: string; title: string; body: RichText }

export const introSteps: IntroStep[] = [
  {
    image: step1,
    title: 'Privacy first',
    body: [
      'Your requests run in a ',
      { b: 'hardware-backed enclave' },
      ' — your identity never reaches the AI. Verifiable in the ',
      { b: 'Verification Center' },
      '.',
    ],
  },
  {
    image: step2,
    title: 'Chat & projects',
    body: [
      'Just start asking — no setup needed. Attach a folder to turn it into a Project: the agent works with its files, and permissions ask before actions.',
    ],
  },
  {
    image: step3,
    title: 'Meetings',
    body: [
      'Wisp notices calls and offers to record; transcription happens on-device, call audio never leaves your device. Ask Wisp about your calls or reference any recording in chat with #.',
    ],
  },
  {
    image: step4,
    title: 'Connectors',
    body: ['Hook up Gmail, Calendar, Notion and more — Wisp asks before it touches anything in them.'],
  },
  {
    image: step5,
    title: 'You’re all set',
    body: ['Start a chat, drop in a folder, or let Wisp catch your next call. Everything stays on your terms.'],
  },
]

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TourStep = {
  /** matches a data-tour="…" attribute in the UI */
  anchor: string
  placement: TourPlacement
  title: string
  body: string
}

// Ordered by where the eye goes: the input you type in first (model →
// Thinking → Project), then the right rail top to bottom (Transcript →
// Connectors → Leave a report), then the left rail bottom to top
// (Workspaces → Dashboard), ending on the next place worth visiting.
export const tourSteps: TourStep[] = [
  {
    anchor: 'model',
    placement: 'top',
    title: 'Choose your model',
    body: 'Balanced handles everyday tasks, Advanced takes on complex ones. Prefer a specific model? You’ll find every one under More.',
  },
  {
    anchor: 'thinking',
    placement: 'top',
    title: 'Thinking: on or off',
    body: 'Turn it on and Wisp reasons step by step before it answers — slower, but sharper on hard questions. Leave it off for quick replies.',
  },
  {
    anchor: 'project',
    placement: 'top',
    title: 'Turn a folder into a Project',
    body: 'Attach a folder and Wisp works with its files. It always asks before it changes anything.',
  },
  {
    anchor: 'transcript',
    placement: 'left',
    title: 'Meeting transcripts',
    body: 'Wisp notices calls and offers to record them. Transcripts stay on this Mac — mention any recording in chat with #.',
  },
  {
    anchor: 'connectors',
    placement: 'left',
    title: 'Connect your apps',
    body: 'Gmail, Calendar, Notion and more. Wisp asks before it touches anything in them.',
  },
  {
    anchor: 'feedback',
    placement: 'left',
    title: 'Leave a report',
    body: 'Something broken, confusing or missing? Send it from here — it goes straight to the team.',
  },
  {
    anchor: 'workspaces',
    placement: 'right',
    title: 'Workspaces',
    body: 'Keep Home, Work and side projects apart. Each workspace has its own widgets and only sees the tools you give it.',
  },
  {
    anchor: 'dashboard',
    placement: 'right',
    title: 'Your dashboard',
    body: 'Widgets from your tools in one place — chats waiting on you, today’s meetings, and anything you ask Wisp to track.',
  },
]
