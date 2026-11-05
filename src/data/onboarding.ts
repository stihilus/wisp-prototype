// First-time experience content.
// 1st launch: the Welcome modal (+ the 5-step "How it works").
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
    title: 'Privacy by design',
    body: [
      'Wisp runs AI in ',
      { b: 'sealed hardware' },
      ' that nobody, including us, can see inside of. No “trust us”: check it yourself in the ',
      { b: 'Verification Center' },
      '.',
    ],
  },
  {
    image: step2,
    title: 'Chat & projects',
    body: ['Talk to Wisp privately about anything, or let it work with your files to analyze docs, create reports or write code.'],
  },
  {
    image: step3,
    title: 'Confidential notetaker',
    body: ['Record your meetings without a bot joining the call. Wisp transcribes and stores your notes locally, then deletes the audio.'],
  },
  {
    image: step4,
    title: 'Connect your tools',
    body: ['Hook up Gmail, Notion, Telegram or custom connections. Set up rules on how Wisp can use them.'],
  },
  {
    image: step5,
    title: 'Schedule your tasks',
    body: ['Set up recurring tasks for the Wisp agent: daily briefs, competitive research or alert bots.'],
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
