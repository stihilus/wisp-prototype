// Everything the Home dashboard prototype shows: the tools you can connect,
// the ready-made views ("presets") each widget can switch between, the mock
// content behind every widget, and the starting layouts from Figma
// (🏠 Home + Workspaces — v3).

export type ToolId =
  | 'telegram'
  | 'gmail'
  | 'calendar'
  | 'granola'
  | 'linear'
  | 'notion'
  | 'drive'
  | 'posthog'
  | 'health'

export type CustomKind = 'chart' | 'summary' | 'topic'
export type WidgetKind = ToolId | CustomKind
export type PlaceholderKind = 'telegram' | 'gmail' | 'calendar' | 'granola' | 'linear' | 'custom' | 'more'

export type Rect = { x: number; y: number; w: number; h: number }

export type Widget = Rect & {
  id: string
  kind: WidgetKind
  preset: string
  prompt?: string
  /** folder / label ids this workspace may read (Telegram, Gmail) */
  scope?: string[]
  /** Granola to-dos ticked off */
  done?: string[]
  updatedAt?: number
}

export type Placeholder = Rect & { id: PlaceholderKind }

export type Tint = 'sand' | 'brand' | 'blue' | 'green' | 'pink' | 'violet' | 'teal'

export type Workspace = {
  id: string
  name: string
  letter: string
  tint: Tint
  widgets: Widget[]
  placeholders: Placeholder[]
  refreshedAt: number
}

export const GRID_COLS = 4
export const MAX_ROWS_PER_WIDGET = 3

export const tintColors: Record<Tint, string> = {
  sand: 'rgba(192, 186, 171, 0.45)',
  brand: 'rgba(255, 193, 109, 0.45)',
  blue: 'rgba(108, 147, 255, 0.45)',
  green: 'rgba(75, 222, 128, 0.45)',
  pink: 'rgba(255, 126, 182, 0.45)',
  violet: 'rgba(177, 140, 255, 0.45)',
  teal: 'rgba(83, 237, 214, 0.45)',
}

export const tintOrder: Tint[] = ['sand', 'brand', 'blue', 'green', 'pink', 'violet', 'teal']

/* ------------------------------------------------------------------ tools */

export type ScopeFolder = { id: string; name: string; count: number }

export type ToolMeta = {
  id: ToolId
  name: string
  short: string
  /** one-liner in the "Add more to …" strip */
  blurb: string
  size: { w: number; h: number }
  account?: string
  scope?: { noun: string; unit: string; folders: ScopeFolder[] }
}

export const tools: Record<ToolId, ToolMeta> = {
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    short: 'Telegram',
    blurb: 'Chats you skipped',
    size: { w: 2, h: 2 },
    account: 'Nemo · @nemo',
    scope: {
      noun: 'folders',
      unit: 'chats',
      folders: [
        { id: 'work', name: 'Work', count: 12 },
        { id: 'lido', name: 'Lido', count: 8 },
        { id: 'family', name: 'Family', count: 4 },
        { id: 'crypto', name: 'Crypto', count: 23 },
        { id: 'channels', name: 'Channels', count: 41 },
        { id: 'archived', name: 'Archived', count: 96 },
      ],
    },
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    short: 'Gmail',
    blurb: 'Emails that need you',
    size: { w: 2, h: 2 },
    account: 'nemo@usewisp.io',
    scope: {
      noun: 'labels',
      unit: 'emails',
      folders: [
        { id: 'primary', name: 'Primary', count: 48 },
        { id: 'work', name: 'Work', count: 26 },
        { id: 'clients', name: 'Clients', count: 17 },
        { id: 'receipts', name: 'Receipts', count: 112 },
        { id: 'newsletters', name: 'Newsletters', count: 340 },
        { id: 'archived', name: 'Archived', count: 2104 },
      ],
    },
  },
  calendar: { id: 'calendar', name: 'Google Calendar', short: 'Calendar', blurb: 'Know what’s next', size: { w: 1, h: 1 }, account: 'nemo@usewisp.io' },
  granola: { id: 'granola', name: 'Granola', short: 'Granola', blurb: 'Keep your promises', size: { w: 1, h: 1 }, account: 'Nemo' },
  linear: { id: 'linear', name: 'Linear', short: 'Linear', blurb: 'See team progress', size: { w: 1, h: 1 }, account: 'Wisp workspace' },
  notion: { id: 'notion', name: 'Notion', short: 'Notion', blurb: 'Track doc changes', size: { w: 1, h: 1 }, account: 'Wisp HQ' },
  drive: { id: 'drive', name: 'Google Drive', short: 'Drive', blurb: 'Files shared with you', size: { w: 1, h: 1 }, account: 'nemo@usewisp.io' },
  posthog: { id: 'posthog', name: 'PostHog', short: 'PostHog', blurb: 'Traffic and sign-ups', size: { w: 2, h: 2 }, account: 'usewisp.io' },
  health: { id: 'health', name: 'Apple Health', short: 'Health', blurb: 'Steps, sleep, heart', size: { w: 2, h: 1 }, account: 'This Mac' },
}

/** order used by the "Add more" strip, the Add widget menu and the modal */
export const toolOrder: ToolId[] = ['telegram', 'gmail', 'calendar', 'granola', 'linear', 'notion', 'drive', 'posthog', 'health']

export const customMeta: Record<CustomKind, { name: string; blurb: string; size: { w: number; h: number } }> = {
  chart: { name: 'Chart', blurb: 'Numbers from any tool, over time', size: { w: 2, h: 1 } },
  summary: { name: 'Summary across tools', blurb: 'One digest from Telegram, Gmail and Calendar', size: { w: 2, h: 1 } },
  topic: { name: 'Watch a topic', blurb: 'Everything that mentions a client or project', size: { w: 1, h: 2 } },
}

export const customOrder: CustomKind[] = ['chart', 'summary', 'topic']

export function isTool(kind: WidgetKind): kind is ToolId {
  return kind in tools
}

/** the tool a widget reads from — custom charts count as their source tool */
export function sourceTool(widget: Pick<Widget, 'kind' | 'preset'>): ToolId | undefined {
  if (isTool(widget.kind)) return widget.kind
  if (widget.kind === 'chart') return widget.preset === 'signups' ? 'posthog' : 'linear'
  return undefined
}

export function kindName(kind: WidgetKind) {
  return isTool(kind) ? tools[kind].name : customMeta[kind].name
}

export function defaultSize(kind: WidgetKind) {
  return isTool(kind) ? tools[kind].size : customMeta[kind].size
}

/* ---------------------------------------------------------------- presets */

export type Preset = {
  id: string
  /** chip label in "Change what this widget shows" */
  chip: string
  /** row title + description in "Add to …" */
  title: string
  desc: string
  prompt: string
}

export const presets: Record<WidgetKind, Preset[]> = {
  telegram: [
    {
      id: 'skipped',
      chip: 'Chats waiting on my reply',
      title: 'Chats you skipped',
      desc: 'Summary of busy chats since you last looked',
      prompt: 'Show chats where someone is waiting on my answer. Skip muted groups and channels. Newest first.',
    },
    {
      id: 'news',
      chip: 'Top 5 news from channels',
      title: 'Top news from channels',
      desc: 'Five posts worth reading, from 41 channels',
      prompt: 'Pick the 5 most important posts from my channels today. One line each, with the channel name.',
    },
    {
      id: 'mentions',
      chip: 'Where I was mentioned',
      title: 'Where you were mentioned',
      desc: 'Every @you across your folders',
      prompt: 'Show every message that mentions @nemo, across all my folders. Newest first.',
    },
    {
      id: 'morning',
      chip: 'Summary of one group',
      title: 'One chat, every morning',
      desc: 'Pick a chat — get its digest at 9:00',
      prompt: 'Every morning at 9:00, summarize Lido core. Decisions first, then open questions.',
    },
  ],
  gmail: [
    {
      id: 'reply',
      chip: 'Emails that need a reply',
      title: 'Needs a reply',
      desc: 'Emails waiting on you',
      prompt: 'Show emails where someone is waiting on my answer. Skip newsletters and notifications.',
    },
    {
      id: 'people',
      chip: 'From people I choose',
      title: 'From people you choose',
      desc: 'Only these senders, nothing else',
      prompt: 'Only show emails from Jared Dunn, Kalash and Google Cloud. Newest first.',
    },
    {
      id: 'digest',
      chip: 'Newsletter digest',
      title: 'Newsletter digest',
      desc: 'One summary instead of twenty emails',
      prompt: 'Summarize today’s newsletters in a few lines. Skip promotions.',
    },
  ],
  calendar: [
    {
      id: 'today',
      chip: 'Next meeting and today',
      title: 'Today',
      desc: 'Next meeting and the rest of the day',
      prompt: 'Show my next meeting with who’s in it, then the rest of today.',
    },
    {
      id: 'prep',
      chip: 'Prep for my next meeting',
      title: 'Prep for my next meeting',
      desc: 'Who, what was said last time, open items',
      prompt: 'Before each meeting, show who’s coming, what we said last time and what’s still open.',
    },
  ],
  granola: [
    {
      id: 'promises',
      chip: 'What I said I’d do',
      title: 'Promised in meetings',
      desc: 'What you said you’d do',
      prompt: 'List everything I said I’d do in yesterday’s meetings. Oldest first. Hide what’s done.',
    },
    {
      id: 'recap',
      chip: 'Last meeting recap',
      title: 'Last meeting recap',
      desc: 'Decisions and next steps',
      prompt: 'Recap my last meeting: decisions first, then next steps with owners.',
    },
  ],
  linear: [
    {
      id: 'team',
      chip: 'Team this week',
      title: 'Team this week',
      desc: 'Closed vs in progress, with the trend',
      prompt: 'Show what the team closed this week versus what’s still in progress.',
    },
    {
      id: 'mine',
      chip: 'My open issues',
      title: 'My open issues',
      desc: 'Assigned to you, by priority',
      prompt: 'Show issues assigned to me, highest priority first. Hide anything in review.',
    },
  ],
  notion: [
    {
      id: 'changed',
      chip: 'Pages changed since yesterday',
      title: 'Changed since yesterday',
      desc: 'Pages your team edited',
      prompt: 'Show pages in Wisp HQ that changed since yesterday, with who edited them.',
    },
    {
      id: 'mentions',
      chip: 'Comments that mention me',
      title: 'Where you were mentioned',
      desc: 'Comments and @mentions',
      prompt: 'Show comments and @mentions for me across Wisp HQ. Unresolved first.',
    },
  ],
  drive: [
    {
      id: 'shared',
      chip: 'New files shared with me',
      title: 'Shared with you',
      desc: 'New files from other people',
      prompt: 'Show files people shared with me this week. Newest first.',
    },
    {
      id: 'recent',
      chip: 'Docs I edited this week',
      title: 'Recently edited',
      desc: 'Docs you touched this week',
      prompt: 'Show the docs I edited this week, so I can pick up where I left off.',
    },
  ],
  posthog: [
    {
      id: 'traffic',
      chip: 'Visitors and sign-ups',
      title: 'Traffic',
      desc: 'Visitors, downloads and sign-ups',
      prompt: 'Show unique visitors for usewisp.io over the last 30 days, and flag any spike.',
    },
    {
      id: 'funnel',
      chip: 'Sign-up funnel',
      title: 'Sign-up funnel',
      desc: 'Where people drop off',
      prompt: 'Show the funnel from visit to download to sign-up for the last 30 days.',
    },
  ],
  health: [
    {
      id: 'vitals',
      chip: 'Steps, sleep and heart rate',
      title: 'Daily vitals',
      desc: 'Steps, sleep and resting heart rate',
      prompt: 'Show my steps today, last night’s sleep and my 7-day resting heart rate.',
    },
    {
      id: 'sleep',
      chip: 'Sleep trend',
      title: 'Sleep trend',
      desc: 'The last 7 nights',
      prompt: 'Chart how long I slept each night this week and compare it to my average.',
    },
  ],
  chart: [
    {
      id: 'issues',
      chip: 'Issues closed each week',
      title: 'Chart',
      desc: 'Numbers from any tool, over time — e.g. Linear issues closed per week',
      prompt: 'Chart how many Linear issues the team closed each week, for the last 8 weeks.',
    },
    {
      id: 'signups',
      chip: 'Sign-ups each week',
      title: 'Sign-ups chart',
      desc: 'Weekly sign-ups from PostHog',
      prompt: 'Chart weekly sign-ups from PostHog for the last 8 weeks.',
    },
  ],
  summary: [
    {
      id: 'morning',
      chip: 'Morning digest',
      title: 'Summary across tools',
      desc: 'One digest from Telegram, Gmail and Calendar',
      prompt: 'Every morning, give me one digest from Telegram, Gmail and Calendar. Three lines, most urgent first.',
    },
    {
      id: 'week',
      chip: 'Week ahead',
      title: 'Week ahead',
      desc: 'Deadlines and meetings for the next 7 days',
      prompt: 'On Mondays, list the deadlines and important meetings for the week, across all my tools.',
    },
  ],
  topic: [
    {
      id: 'lido',
      chip: 'Lido',
      title: 'Watch a topic',
      desc: 'Everything that mentions a client or project, from every tool',
      prompt: 'Watch everything that mentions Lido, from every tool. Newest first.',
    },
    {
      id: 'meridian',
      chip: 'Meridian Capital',
      title: 'Watch Meridian Capital',
      desc: 'Every mention of the term sheet deal',
      prompt: 'Watch everything that mentions Meridian Capital or the term sheet, from every tool.',
    },
  ],
}

export function presetFor(kind: WidgetKind, id: string) {
  return presets[kind].find((p) => p.id === id) ?? presets[kind][0]
}

/* ---------------------------------------------------------------- content */

export type ChatItem = {
  id: string
  initials: string
  name: string
  count: number
  text: string
  gradient: [string, string]
  folder: string
  needsYou: boolean
  muted?: boolean
}

export type RowItem = { title: string; sub: string; meta?: string }
export type DigestItem = { tool: WidgetKind; text: string }

export type WidgetBodySpec =
  | { type: 'chats'; items: ChatItem[] }
  | { type: 'emails'; items: RowItem[] }
  | { type: 'rows'; items: RowItem[] }
  | { type: 'agenda'; items: { time: string; title: string }[] }
  | { type: 'todos'; items: { id: string; text: string }[] }
  | { type: 'traffic' }
  | { type: 'funnel' }
  | { type: 'vitals' }
  | { type: 'bars'; value: string; valueSub: string; values: number[]; labels?: string[] }
  | { type: 'digest'; items: DigestItem[] }

export type WidgetContent = {
  /** header name override (custom widgets name their source) */
  source?: WidgetKind
  headline: string
  sub?: string
  body: WidgetBodySpec
  cta: string
  reply: string
}

export const telegramChats: ChatItem[] = [
  {
    id: 'lido-core',
    initials: 'LC',
    name: 'Lido core',
    count: 12,
    text: 'Decision needed on the validator exit window before Friday.',
    gradient: ['#53edd6', '#28c9b7'],
    folder: 'lido',
    needsYou: true,
  },
  {
    id: 'wisp-team',
    initials: 'WT',
    name: 'Wisp team',
    count: 31,
    text: 'Headless agent build is green — Kalash is asking for a review.',
    gradient: ['#82b1ff', '#665fff'],
    folder: 'work',
    needsYou: true,
  },
  {
    id: 'family',
    initials: 'F',
    name: 'Family',
    count: 8,
    text: 'Dinner moved to Saturday, 19:00.',
    gradient: ['#ffcd6a', '#ffa85c'],
    folder: 'family',
    needsYou: true,
  },
  {
    id: 'offsite',
    initials: 'OB',
    name: 'Offsite Belgrade',
    count: 5,
    text: 'Photos from the offsite are in the shared album.',
    gradient: ['#a0de7e', '#54cb68'],
    folder: 'work',
    needsYou: false,
  },
  {
    id: 'lobster',
    initials: 'LD',
    name: 'Lobster DAO',
    count: 120,
    text: 'Mostly memes. One thread on restaking yields might be worth a look.',
    gradient: ['#ff885e', '#ff516a'],
    folder: 'crypto',
    needsYou: false,
    muted: true,
  },
]

const granolaTodos = [
  { id: 't1', text: 'Send the model picker options to Kalash' },
  { id: 't2', text: 'Review the audit page for the headless agent' },
  { id: 't3', text: 'Reply to Lido about BigQuery access' },
  { id: 't4', text: 'Share the offsite photos with the team' },
]

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

function listNames(names: string[]) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function widgetContent(widget: Widget): WidgetContent {
  const preset = presetFor(widget.kind, widget.preset).id

  switch (widget.kind) {
    case 'telegram': {
      if (preset === 'news') {
        return {
          headline: 'Top 5 from your channels',
          sub: 'From 41 channels, since yesterday',
          body: {
            type: 'rows',
            items: [
              { title: 'Protocol Watch', sub: 'Lido v3 audit report is out — no critical findings.' },
              { title: 'The Block', sub: 'Ethereum validator exit queue hits a 6-month low.' },
              { title: 'HN Digest', sub: 'Apple opens on-device models to third-party apps.' },
              { title: 'Lenny’s Newsletter', sub: 'How the best teams write product specs in 2026.' },
              { title: 'Belgrade Tech', sub: '12 co-working spots with good coffee, ranked.' },
            ],
          },
          cta: 'Tell me more about the Lido audit',
          reply:
            'The Lido v3 audit came back clean — two medium findings, both already fixed in the release candidate. The team is shipping it to mainnet next Tuesday. Want me to pull the full report from Protocol Watch?',
        }
      }
      if (preset === 'mentions') {
        return {
          headline: 'You were mentioned 4 times',
          sub: 'Since yesterday, across 3 folders',
          body: {
            type: 'rows',
            items: [
              { title: 'Wisp team · Kalash', sub: '@nemo can you check the audit page before we ship?' },
              { title: 'Lido core · Isidoros', sub: '@nemo 48h or 72h for the exit window? Need your call.' },
              { title: 'Offsite Belgrade · Sergey', sub: '@nemo you’re in three of these, okay to share?' },
              { title: 'Lobster DAO · gm', sub: '@nemo the restaking thread is live.' },
            ],
          },
          cta: 'Reply to the mentions with Wisp',
          reply:
            'Drafted replies for the two that matter:\n\n• Kalash — “Looking at the audit page now, notes in 30 min.”\n• Isidoros — “Let’s go with 72h, it gives operators room to react.”\n\nThe other two don’t need an answer. Send both?',
        }
      }
      if (preset === 'morning') {
        return {
          headline: 'Lido core this morning',
          sub: 'Digest at 9:00 · 12 new messages',
          body: {
            type: 'digest',
            items: [
              { tool: 'telegram', text: 'Exit window: the team leans 72h and wants your call by Friday.' },
              { tool: 'telegram', text: 'BigQuery access for the analytics dashboard is still pending.' },
              { tool: 'telegram', text: 'Core call moved to 11:30 today.' },
            ],
          },
          cta: 'Ask Wisp what Lido needs from me',
          reply:
            'Lido needs two things from you: a decision on the validator exit window (they lean 72h) by Friday, and BigQuery access for their dashboard. The core call at 11:30 is a good moment for both.',
        }
      }

      const scope = widget.scope
      const chats = scope
        ? telegramChats.filter((c) => scope.includes(c.folder) || scope.includes(`chat:${c.id}`))
        : telegramChats
      const needs = chats.filter((c) => c.needsYou).length
      let sub = '51 unread across Work and Lido folders'
      if (scope) {
        const unread = chats.reduce((sum, c) => sum + c.count, 0)
        const names = tools.telegram.scope!.folders.filter((f) => scope.includes(f.id)).map((f) => f.name)
        const singles = scope.filter((s) => s.startsWith('chat:')).length
        if (singles) names.push(`${plural(singles, 'single chat', 'single chats')}`)
        sub = names.length
          ? `${unread} unread across ${listNames(names)}${singles ? '' : names.length === 1 ? ' folder' : ' folders'}`
          : 'No chats shared with this workspace yet'
      }
      return {
        headline: needs ? `${plural(needs, 'chat needs', 'chats need')} you` : 'You’re all caught up',
        sub,
        body: { type: 'chats', items: chats },
        cta: 'Summarize everything I missed',
        reply:
          'Here’s what you missed:\n\n• Lido core — they need your call on the validator exit window before Friday. The team leans 72h.\n• Wisp team — the headless agent build is green; Kalash wants your review on the audit page.\n• Family — dinner moved to Saturday at 19:00.\n\nOffsite Belgrade and Lobster DAO can wait. Want me to draft a reply to Lido core?',
      }
    }

    case 'gmail': {
      if (preset === 'digest') {
        return {
          headline: '7 newsletters, 3 worth reading',
          sub: 'Since yesterday · promotions skipped',
          body: {
            type: 'rows',
            items: [
              { title: 'Stratechery', sub: 'Why on-device AI changes the privacy pitch.' },
              { title: 'Lenny’s Newsletter', sub: 'The onboarding checklist that doubled activation.' },
              { title: 'Bankless', sub: 'Restaking yields are compressing — what’s next.' },
            ],
          },
          cta: 'Read me the digest',
          reply:
            'Three worth your time:\n\n• Stratechery argues on-device models make privacy a feature people will actually pay for — relevant to our positioning.\n• Lenny’s piece on onboarding checklists has a pattern we could borrow for workspaces.\n• Bankless says restaking yields are compressing — useful context for Lido.',
        }
      }
      const items: RowItem[] = [
        { title: 'Jared Dunn', sub: 'Contract redlines — can you confirm by Thursday?' },
        { title: 'Google Cloud', sub: 'Verification: we need one more document from you.' },
        { title: 'Kalash', sub: 'Notes from the dashboard call — MVP scope and who does what.' },
        { title: 'App Store Connect', sub: 'Wisp for iOS: a new build is ready to test in TestFlight.' },
      ]
      return {
        headline: preset === 'people' ? '3 new from your people' : '2 of 14 new emails need you',
        sub: preset === 'people' ? 'Jared Dunn, Kalash and Google Cloud' : undefined,
        body: { type: 'emails', items: preset === 'people' ? items.slice(0, 3) : items },
        cta: 'Draft the replies with Wisp',
        reply:
          'Two emails need you:\n\n1. Jared Dunn wants the contract redlines confirmed by Thursday. Draft: “Hi Jared — the redlines look good, I’ll confirm tomorrow after one more pass on clause 7.”\n2. Google Cloud needs one more verification document — it’s the business registration PDF in your Drive.\n\nOpen both drafts?',
      }
    }

    case 'calendar': {
      if (preset === 'prep') {
        return {
          headline: 'Prep: Design sync',
          sub: 'In 25 min · Kalash, Nemo, Sergey',
          body: {
            type: 'rows',
            items: [
              { title: 'Last time', sub: 'You agreed to cut the model picker to two tiers.' },
              { title: 'Still open', sub: 'Who owns the copy for the audit page.' },
              { title: 'Kalash asked', sub: 'Send the model picker options before the call.' },
            ],
          },
          cta: 'Draft my talking points',
          reply:
            'Talking points for the design sync:\n\n1. Model picker — confirm the two-tier version (Balanced / Advanced) and “More” for specific models.\n2. Audit page — decide who owns the copy; Kalash suggested you.\n3. Workspaces — show the new Home widgets and ask for feedback on scope per workspace.',
        }
      }
      return {
        headline: 'Design sync in 25 min',
        sub: 'Kalash, Nemo, Sergey · Google Meet',
        body: {
          type: 'agenda',
          items: [
            { time: '11:30', title: 'Lido core call' },
            { time: '14:00', title: 'Interview — Marina' },
            { time: '16:30', title: '1:1 with Nemo' },
          ],
        },
        cta: 'Prep me for the design sync',
        reply:
          'For the design sync in 25 min: last time you agreed to cut the model picker to two tiers, and Kalash asked for the options before the call — that’s still on your Granola list. Want me to send them now?',
      }
    }

    case 'granola': {
      if (preset === 'recap') {
        return {
          headline: 'Design review · recap',
          sub: 'Yesterday · 45 min · 4 people',
          body: {
            type: 'rows',
            items: [
              { title: 'Decided', sub: 'Ship the two-tier model picker in the next build.' },
              { title: 'Decided', sub: 'The audit page goes out with the Friday release.' },
              { title: 'Next · Kalash', sub: 'Final copy for workspaces by Thursday.' },
            ],
          },
          cta: 'Ask Wisp about this',
          reply:
            'Yesterday’s design review landed two decisions: the two-tier model picker ships next build, and the audit page goes out Friday. Kalash owns the workspace copy (due Thursday).',
        }
      }
      const done = widget.done ?? []
      const open = granolaTodos.filter((t) => !done.includes(t.id)).length
      return {
        headline: open ? `${open} ${open === 1 ? 'thing' : 'things'} you said you’d do` : 'All promises kept',
        sub: 'From yesterday’s 3 meetings',
        body: { type: 'todos', items: granolaTodos },
        cta: 'Ask Wisp about this',
        reply:
          'From yesterday’s meetings you promised Kalash the model picker options, a review of the audit page, and a reply to Lido about BigQuery access. The Kalash one is the most urgent — the design sync is in 25 minutes.',
      }
    }

    case 'linear': {
      if (preset === 'mine') {
        return {
          headline: '5 issues assigned to you',
          sub: '2 urgent · 1 due today',
          body: {
            type: 'rows',
            items: [
              { title: 'WSP-219 Widget resize on small screens', sub: 'Urgent · due today' },
              { title: 'WSP-221 Onboarding copy for workspaces', sub: 'High · due Friday' },
              { title: 'WSP-198 Remove the old connectors page', sub: 'Medium' },
            ],
          },
          cta: 'Ask Wisp what to pick up first',
          reply: 'Start with WSP-219 — it’s due today and blocks the Friday build. WSP-221 can wait until tomorrow.',
        }
      }
      return {
        headline: '14 closed this week',
        sub: '6 in progress · 2 blocked',
        body: {
          type: 'rows',
          items: [
            { title: 'WSP-212 Headless agent audit page', sub: 'Closed by Kalash · 2h ago' },
            { title: 'WSP-208 Model picker tiers', sub: 'Closed by Nemo · 5h ago' },
            { title: 'WSP-215 Telegram scope per workspace', sub: 'In progress · Sergey' },
          ],
        },
        cta: 'Ask Wisp about this',
        reply:
          'The team closed 14 issues this week — 4 more than last week. Two are blocked: WSP-215 waits on the Telegram scope API, and WSP-217 on design review.',
      }
    }

    case 'notion': {
      if (preset === 'mentions') {
        return {
          headline: '2 comments mention you',
          sub: 'Both unresolved',
          body: {
            type: 'rows',
            items: [
              { title: 'Homepage MVP scope', sub: 'Kalash: @Nemo is the feed in or out for v1?' },
              { title: 'Q4 roadmap', sub: 'Sergey: @Nemo can you size the workspaces work?' },
            ],
          },
          cta: 'Ask Wisp about this',
          reply: 'Kalash wants to know if the feed is in v1 (the Figma says yes), and Sergey needs a size estimate for workspaces. Want me to draft both replies?',
        }
      }
      return {
        headline: '6 pages changed since yesterday',
        body: {
          type: 'rows',
          items: [
            { title: 'Homepage MVP scope', sub: 'Edited by Kalash · 1h ago' },
            { title: 'Q4 roadmap', sub: 'Edited by Nemo · 5h ago' },
            { title: 'Hiring plan', sub: 'Edited by Sergey · yesterday' },
            { title: 'Brand voice', sub: 'Edited by Marina · yesterday' },
          ],
        },
        cta: 'Ask Wisp about this',
        reply:
          'The biggest change is in Homepage MVP scope — Kalash moved the feed into v1 and cut custom widgets to “Chart only”. The Q4 roadmap now has workspaces in October.',
      }
    }

    case 'drive': {
      if (preset === 'recent') {
        return {
          headline: '4 docs you edited this week',
          body: {
            type: 'rows',
            items: [
              { title: 'Workspaces — spec v2', sub: 'Edited 2h ago' },
              { title: 'Investor update — September', sub: 'Edited yesterday' },
              { title: 'Offsite budget.xlsx', sub: 'Edited Monday' },
            ],
          },
          cta: 'Ask Wisp about this',
          reply: 'You left “Workspaces — spec v2” mid-section on scope per workspace. Want me to draft the rest from the Figma notes?',
        }
      }
      return {
        headline: '3 new files shared with you',
        body: {
          type: 'rows',
          items: [
            { title: 'Lido commercial agreement v3.pdf', sub: 'Shared by Jared Dunn' },
            { title: 'Offsite photos', sub: 'Shared by Sergey · 42 items' },
            { title: 'Q3 close — numbers.xlsx', sub: 'Shared by Anna · yesterday' },
          ],
        },
        cta: 'Ask Wisp about this',
        reply:
          'Jared shared the Lido commercial agreement v3 — the only change from v2 is the termination clause (90 → 60 days). Sergey’s offsite album has 42 photos, and Anna’s Q3 close sheet is ready for review.',
      }
    }

    case 'posthog': {
      if (preset === 'funnel') {
        return {
          headline: '2.7% of visitors sign up',
          sub: 'Last 30 days · usewisp.io',
          body: { type: 'funnel' },
          cta: 'Ask Wisp where people drop off',
          reply:
            'The biggest drop is visit → download (15%). Visitors from “Is ChatGPT safe?” download at 2× the average, so that page is doing the heavy lifting.',
        }
      }
      return {
        headline: 'Unique visitors',
        body: { type: 'traffic' },
        cta: 'Ask Wisp why the spike on Sep 18 held',
        reply:
          'The Sep 18 spike came from “Is ChatGPT safe?” getting picked up by two newsletters. It held because 31% of those visitors landed on /private-ai and that page now ranks for “private AI assistant”. Downloads from it are up 12%.',
      }
    }

    case 'health': {
      if (preset === 'sleep') {
        return {
          headline: '7h 12m average sleep',
          sub: 'Last 7 nights · 24 min more than last week',
          body: { type: 'bars', value: '7h 12m', valueSub: 'last night', values: [6.2, 6.8, 7.4, 6.5, 7.9, 7.1, 7.2] },
          cta: 'Ask Wisp how my week compares',
          reply: 'You slept 24 minutes more per night than last week, and went to bed more consistently (±20 min). Friday was the outlier.',
        }
      }
      return {
        headline: 'Apple Health',
        body: { type: 'vitals' },
        cta: 'Ask Wisp how my week compares',
        reply:
          'A good week: steps are up 11% on your average, sleep is steady at just over 7 hours, and resting heart rate dropped 2 bpm. The one dip was Thursday — 4,100 steps and 6h of sleep.',
      }
    }

    case 'chart': {
      if (preset === 'signups') {
        return {
          source: 'posthog',
          headline: 'Sign-ups each week',
          sub: 'Last 8 weeks',
          body: { type: 'bars', value: '96', valueSub: 'this week · 18 more than last', values: [52, 61, 58, 70, 64, 74, 78, 96] },
          cta: 'Ask Wisp about this',
          reply: 'Sign-ups grew 85% over 8 weeks. The jump this week lines up with the “Is ChatGPT safe?” article.',
        }
      }
      return {
        source: 'linear',
        headline: 'Issues closed each week',
        sub: 'Last 8 weeks',
        body: { type: 'bars', value: '14', valueSub: 'this week · 4 more than last', values: [8, 11, 6, 13, 10, 12, 10, 14] },
        cta: 'Ask Wisp about this',
        reply: 'The team closed 14 issues this week — the best week in the last 8. The average is 10.5, and the dips line up with the offsite and a release freeze.',
      }
    }

    case 'summary': {
      if (preset === 'week') {
        return {
          headline: 'Your week ahead',
          sub: 'Deadlines and meetings, next 7 days',
          body: {
            type: 'digest',
            items: [
              { tool: 'gmail', text: 'Thursday — confirm the contract redlines with Jared.' },
              { tool: 'telegram', text: 'Friday — Lido needs the validator exit decision.' },
              { tool: 'linear', text: 'Friday — release with the audit page.' },
            ],
          },
          cta: 'Ask Wisp to plan my week',
          reply: 'Your week hinges on Friday: the Lido decision and the release. I’d block Thursday afternoon for the redlines and the audit page review.',
        }
      }
      return {
        headline: 'Your morning in 3 lines',
        sub: 'From Telegram, Gmail and Calendar',
        body: {
          type: 'digest',
          items: [
            { tool: 'telegram', text: 'Lido core needs your call on the validator exit window by Friday.' },
            { tool: 'gmail', text: 'Jared wants the contract redlines confirmed by Thursday.' },
            { tool: 'calendar', text: 'Design sync in 25 min — Kalash is waiting on the model picker options.' },
          ],
        },
        cta: 'Ask Wisp what to do first',
        reply:
          'Do the model picker options first — the design sync starts in 25 minutes and Kalash is waiting on them. Then reply to Lido (Friday deadline), and the redlines can wait until tomorrow.',
      }
    }

    case 'topic': {
      if (preset === 'meridian') {
        return {
          headline: 'Meridian Capital · 3 mentions',
          sub: 'Since Monday, from 3 tools',
          body: {
            type: 'digest',
            items: [
              { tool: 'gmail', text: 'Term sheet v4 is back with comments on the liquidation preference.' },
              { tool: 'calendar', text: 'Partner call on Thursday at 15:00.' },
              { tool: 'drive', text: 'Meridian — cap table.xlsx was updated.' },
            ],
          },
          cta: 'Ask Wisp what changed',
          reply: 'Meridian pushed back on the 1.5× liquidation preference in term sheet v4 — they want 1×. The partner call Thursday is where it gets decided.',
        }
      }
      return {
        headline: 'Lido · 7 mentions today',
        sub: 'From Telegram, Gmail, Drive and Granola',
        body: {
          type: 'digest',
          items: [
            { tool: 'telegram', text: 'Lido core: decision needed on the validator exit window.' },
            { tool: 'gmail', text: 'Jared Dunn: commercial agreement — redlines attached.' },
            { tool: 'drive', text: 'Lido commercial agreement v3.pdf was shared with you.' },
            { tool: 'granola', text: 'You said you’d reply to Lido about BigQuery access.' },
          ],
        },
        cta: 'Ask Wisp what’s new with Lido',
        reply:
          'Everything Lido today: they need the exit window decision by Friday, the commercial agreement v3 is waiting for your redlines, and you still owe them an answer on BigQuery access.',
      }
    }
  }
}

/* ------------------------------------------------------------ placeholders */

export const placeholderMeta: Record<
  PlaceholderKind,
  { name: string; title: string; logo: WidgetKind | 'custom' | 'more'; connects?: ToolId }
> = {
  telegram: { name: 'Telegram', title: 'Catch up on the chats you skipped', logo: 'telegram', connects: 'telegram' },
  gmail: { name: 'Gmail', title: 'See which emails need a reply', logo: 'gmail', connects: 'gmail' },
  calendar: { name: 'Google Calendar', title: 'Know what’s next today', logo: 'calendar', connects: 'calendar' },
  granola: { name: 'Granola', title: 'Keep what you promised in meetings', logo: 'granola', connects: 'granola' },
  linear: { name: 'Linear', title: 'See how the team is moving', logo: 'linear', connects: 'linear' },
  custom: { name: 'Custom widget', title: 'Turn any tool into a chart', logo: 'custom' },
  more: { name: 'More tools', title: 'Notion, Google Drive and more', logo: 'more' },
}

export const placeholderChats = [
  { initials: 'MT', name: 'Marketing team', count: 12, text: 'Launch moved to Friday. Anna needs your sign-off first.', color: '#3f6f9a' },
  { initials: 'F', name: 'Family', count: 8, text: 'Mom is asking if you’re coming for Sunday lunch.', color: '#9a6a3f' },
  { initials: 'BC', name: 'Book club', count: 5, text: 'Next month’s pick is up for a vote.', color: '#6f4f9a' },
  { initials: 'N', name: 'Neighbours', count: 3, text: 'Water will be off on Thursday morning.', color: '#4f8a4f' },
]

export const placeholderEmails = [
  { title: 'Sarah Chen', sub: 'Can you send the signed contract by Thursday?' },
  { title: 'David Park', sub: 'Your lease renewal is attached — please sign by Friday.' },
  { title: 'Anna Kowalski', sub: 'Launch plan v2 is ready for comments.' },
]

export function defaultPlaceholders(): Placeholder[] {
  return [
    { id: 'telegram', x: 0, y: 0, w: 2, h: 2 },
    { id: 'gmail', x: 2, y: 0, w: 1, h: 2 },
    { id: 'calendar', x: 3, y: 0, w: 1, h: 1 },
    { id: 'granola', x: 3, y: 1, w: 1, h: 1 },
    { id: 'custom', x: 0, y: 2, w: 2, h: 1 },
    { id: 'linear', x: 2, y: 2, w: 1, h: 1 },
    { id: 'more', x: 3, y: 2, w: 1, h: 1 },
  ]
}

/* --------------------------------------------------------------- scenarios */

let widgetCounter = 0
export function newWidgetId(kind: WidgetKind) {
  widgetCounter += 1
  return `${kind}-${Date.now().toString(36)}-${widgetCounter}`
}

function w(kind: WidgetKind, preset: string, x: number, y: number, width: number, height: number): Widget {
  return { id: newWidgetId(kind), kind, preset, x, y, w: width, h: height }
}

/** 02 — a couple of tools connected, the rest folds into the strip */
export function fewWidgets(): Widget[] {
  return [w('telegram', 'skipped', 0, 0, 2, 2), w('gmail', 'reply', 2, 0, 2, 2)]
}

/** 03 — everything connected ("Drive and the Linear chart moved out") */
export function allWidgets(): Widget[] {
  return [
    w('posthog', 'traffic', 0, 0, 2, 2),
    w('telegram', 'skipped', 2, 0, 1, 2),
    w('calendar', 'today', 3, 0, 1, 1),
    w('granola', 'promises', 3, 1, 1, 1),
    w('health', 'vitals', 0, 2, 2, 1),
    w('gmail', 'reply', 2, 2, 1, 1),
    w('notion', 'changed', 3, 2, 1, 1),
    w('chart', 'issues', 0, 3, 2, 1),
    w('drive', 'shared', 2, 3, 1, 1),
  ]
}

export function seedWorkspaces(): Workspace[] {
  const twoMinAgo = Date.now() - 2 * 60 * 1000
  return [
    { id: 'home', name: 'Home', letter: 'H', tint: 'sand', widgets: [], placeholders: defaultPlaceholders(), refreshedAt: twoMinAgo },
    { id: 'work', name: 'Work', letter: 'W', tint: 'brand', widgets: [], placeholders: defaultPlaceholders(), refreshedAt: twoMinAgo },
    { id: 'side', name: 'Side jobs', letter: 'S', tint: 'blue', widgets: [], placeholders: defaultPlaceholders(), refreshedAt: twoMinAgo },
  ]
}

/** "2 min ago" style label */
export function relativeTime(ts: number, now: number) {
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 45) return 'Just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
