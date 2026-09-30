import type { WidgetKind } from './dashboard'

export type ChatMessage =
  | { id: string; role: 'user' | 'wisp'; text: string }
  | { id: string; role: 'tool'; label: string; url: string }
  /** a widget / update the user pulled into the conversation as context */
  | { id: string; role: 'context'; kinds: WidgetKind[]; title: string; detail: string }

let counter = 0
export function nextId() {
  counter += 1
  return `m${counter}-${Date.now()}`
}

export const scriptedReplies: ChatMessage[] = [
  {
    id: 'seed-1',
    role: 'wisp',
    text: "Happy to help! Quick questions first: who's the funder, and what's the ask amount? I'll pull together a first draft once I have your latest budget doc.",
  },
  { id: 'seed-2', role: 'tool', label: 'Fetch Url', url: 'https://claude.ai' },
  {
    id: 'seed-3',
    role: 'wisp',
    text: "Got it — I've read through the linked page. Here's a first pass at your grant proposal structure, tailored to the funder's guidelines. Want me to expand any section?",
  },
]

export const genericReply: ChatMessage = {
  id: 'generic',
  role: 'wisp',
  text: 'Got it — let me look into that.',
}

// Opening any chat from the sidebar (Starred/Recents) shows this same
// thread — there's no per-chat content behind each row yet, just the demo.
export function buildDefaultChatThread(): ChatMessage[] {
  return [
    {
      id: nextId(),
      role: 'user',
      text: 'Hi Wisp! Could you help me write a grant proposal? If you need more info, just ask — happy to share more context or upload files.',
    },
    ...scriptedReplies.map((reply) => ({ ...reply, id: nextId() })),
  ]
}
