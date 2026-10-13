import type { WidgetKind } from './dashboard'

export type Attachment = { name: string; meta: string }

/** a block inside a long, structured Wisp answer — headings feed the chat outline */
export type AnswerBlock =
  | { type: 'h'; id: string; text: string }
  | { type: 'p'; id: string; text: string }
  | { type: 'quote'; id: string; text: string }
  | { type: 'ul'; id: string; items: { id: string; text: string }[] }

/** what a tool card shows when it's expanded */
export type ToolOutput =
  | { type: 'command'; command: string; cwd: string; result: string }
  | { type: 'results'; items: { title: string; url: string }[] }
  | { type: 'page'; status: string; excerpt: string }
  | { type: 'files'; items: { name: string; meta: string; folder?: boolean }[] }

export type ToolKind = 'fetch' | 'search' | 'files' | 'command' | 'file'

export type ChatMessage =
  | { id: string; role: 'user' | 'wisp'; text: string; attachments?: Attachment[] }
  | {
      id: string
      role: 'tool'
      label: string
      /** the detail after "·" (url, query, command, file name) */
      url: string
      kind?: ToolKind
      output?: ToolOutput
      /** for kind 'file': what it is and how to open it */
      fileMeta?: string
      openWith?: string
    }
  /** Wisp asking before it does something — Allow once / Allow all / Deny */
  | { id: string; role: 'action'; label: string; detail: string; path: string; summary: string; fileTitle: string; fileMeta: string; openWith: string }
  /** a long answer made of headings, paragraphs, lists and quotes */
  | { id: string; role: 'answer'; blocks: AnswerBlock[] }
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

/* -------------------------------------------------------- the demo thread */

// A lawyer and Wisp working through a Series A term sheet: reading the PDFs,
// searching the web, and answering in sections. Block ids are fixed so marks
// the user adds survive reopening the chat.
function legalThread(): ChatMessage[] {
  return [
    {
      id: nextId(),
      role: 'user',
      text: 'Hi Wisp — I’m counsel for Northwind Robotics on their Series A. Meridian Capital just sent term sheet v4 (attached). Can you flag anything off-market and give me a quick read on the economics?',
      attachments: [{ name: 'Meridian_TermSheet_v4.pdf', meta: 'PDF · 12 pages' }],
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'command',
      label: 'Run command',
      url: 'pdftotext "Meridian_TermSheet_v4.pdf" - | head -400',
      output: {
        type: 'command',
        command: 'pdftotext "Meridian_TermSheet_v4.pdf" - | head -400',
        cwd: '~/Clients/Northwind/Series A',
        result:
          '{"exitCode":0,"stdout":"SERIES A PREFERRED STOCK — SUMMARY OF TERMS… Amount of Financing: $18,000,000. Pre-Money Valuation: $62,000,000 on a fully diluted basis, including an increase of the option pool to 12% post-money…"}',
      },
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'search',
      label: 'Brave Search',
      url: 'NVCA model term sheet 2026 liquidation preference',
      output: {
        type: 'results',
        items: [
          { title: 'Model Legal Documents — NVCA', url: 'nvca.org/model-legal-documents' },
          { title: 'Series A terms report, H1 2026', url: 'cooleygo.com/series-a-report-2026' },
          { title: 'Liquidation preferences, explained', url: 'fenwick.com/insights/liquidation-preferences' },
        ],
      },
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'fetch',
      label: 'Fetch Url',
      url: 'https://nvca.org/model-legal-documents',
      output: {
        type: 'page',
        status: '200 OK · text/html · 18 KB',
        excerpt:
          'Model Term Sheet (updated March 2026): “Liquidation Preference: 1× the Original Purchase Price, plus declared but unpaid dividends, on a non-participating basis…”',
      },
    },
    {
      id: nextId(),
      role: 'answer',
      blocks: [
        {
          type: 'p',
          id: 'a1-p0',
          text: 'I read all 12 pages and checked them against the current NVCA model documents and this year’s Series A data. Overall the deal is close to market, with three terms that stand out.',
        },
        { type: 'h', id: 'a1-h1', text: 'The economics at a glance' },
        {
          type: 'ul',
          id: 'a1-l1',
          items: [
            { id: 'a1-l1-1', text: '**$18M** raise at a **$62M pre-money** valuation — about **22.5%** to Meridian after the round.' },
            { id: 'a1-l1-2', text: 'Option pool topped up to **12% post-money**, carved out of the pre-money — so it dilutes the founders, not Meridian.' },
            { id: 'a1-l1-3', text: '**1.5× participating** liquidation preference, with no cap.' },
            { id: 'a1-l1-4', text: 'Pro-rata rights for Meridian in the next two rounds, plus one board seat.' },
          ],
        },
        {
          type: 'p',
          id: 'a1-p1',
          text: 'The headline valuation is in line with comparable robotics rounds this year, but the pool top-up and the preference together shift roughly **$4–5M** of effective value toward the investor.',
        },
        { type: 'h', id: 'a1-h2', text: 'Off-market terms to push back on' },
        {
          type: 'p',
          id: 'a1-p2',
          text: '**Participating 1.5× preference.** The NVCA model and about 80% of 2026 Series A deals use a 1× non-participating preference. Participation on top of a 1.5× multiple lets Meridian take its money back and then share in what’s left — expensive for the founders in a mid-size exit.',
        },
        {
          type: 'p',
          id: 'a1-p3',
          text: '**Full-ratchet anti-dilution (section 4.3).** Broad-based weighted average is the market standard. A full ratchet re-prices Meridian’s whole stake to any lower future price, which can wipe out the founders in a down round.',
        },
        {
          type: 'p',
          id: 'a1-p4',
          text: '**Redemption right after five years (section 7.1).** Rare at Series A and usually dropped on request. If it stays, it should be limited to legally available funds and need a board vote.',
        },
        { type: 'h', id: 'a1-h3', text: 'What looks standard' },
        {
          type: 'p',
          id: 'a1-p5',
          text: 'The protective provisions, information rights, drag-along (with the usual founder protections) and four-year vesting with a one-year cliff all match the NVCA model closely. I wouldn’t spend negotiating capital on them.',
        },
        { type: 'h', id: 'a1-h4', text: 'Suggested next step' },
        {
          type: 'p',
          id: 'a1-p6',
          text: 'Lead with the preference and the ratchet — they matter most in dollar terms — and offer to keep the redemption right with a funds-available limit as a trade. Want me to draft a short issues list for Meridian’s counsel?',
        },
      ],
    },

    {
      id: nextId(),
      role: 'user',
      text: 'Yes — but first, redline the indemnification clause in section 9. Our client can’t accept uncapped founder indemnities.',
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'command',
      label: 'Run command',
      url: 'pdftotext -f 7 -l 8 "Meridian_TermSheet_v4.pdf" -',
      output: {
        type: 'command',
        command: 'pdftotext -f 7 -l 8 "Meridian_TermSheet_v4.pdf" -',
        cwd: '~/Clients/Northwind/Series A',
        result:
          '{"exitCode":0,"stdout":"9. INDEMNIFICATION. 9.2 Each Founder shall indemnify and hold harmless the Investors from and against any and all Losses arising out of any breach of the representations and warranties of the Company…"}',
      },
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'search',
      label: 'Brave Search',
      url: 'founder indemnification cap venture financing market practice',
      output: {
        type: 'results',
        items: [
          { title: 'Founder representations in VC deals — 2026 study', url: 'srsacquiom.com/founder-reps-study' },
          { title: 'NVCA Stock Purchase Agreement, §5 Indemnification', url: 'nvca.org/model-legal-documents' },
          { title: 'When investors ask for founder indemnities', url: 'gunder.com/insights/founder-indemnities' },
        ],
      },
    },
    {
      id: nextId(),
      role: 'answer',
      blocks: [
        { type: 'h', id: 'a2-h1', text: 'What section 9 says today' },
        {
          type: 'p',
          id: 'a2-p1',
          text: 'Section 9.2 makes the **founders personally liable**, jointly and severally, for any breach of the company’s representations — with no cap, no basket and a 36-month survival period.',
        },
        {
          type: 'quote',
          id: 'a2-q1',
          text: '“Each Founder shall indemnify and hold harmless the Investors from and against any and all Losses arising out of any breach of the representations and warranties of the Company…”',
        },
        { type: 'h', id: 'a2-h2', text: 'Proposed redline' },
        {
          type: 'ul',
          id: 'a2-l1',
          items: [
            { id: 'a2-l1-1', text: 'Replace founder liability with **company-only indemnification** for the company’s representations.' },
            { id: 'a2-l1-2', text: 'Limit founder indemnities to their own **fraud or wilful misconduct**.' },
            { id: 'a2-l1-3', text: 'Add a **cap equal to the purchase price** paid by each investor, and a **1% basket**.' },
            { id: 'a2-l1-4', text: 'Shorten survival to **12 months** after closing.' },
          ],
        },
        {
          type: 'quote',
          id: 'a2-q2',
          text: '“The Company shall indemnify the Investors for Losses arising from a breach of the Company’s representations, subject to Section 9.4. No Founder shall have any personal liability except in the case of such Founder’s fraud.”',
        },
        { type: 'h', id: 'a2-h3', text: 'Why this is defensible' },
        {
          type: 'p',
          id: 'a2-p2',
          text: 'Personal founder indemnities are uncommon in venture rounds. The NVCA Stock Purchase Agreement puts the obligation on the company, and the market surveys I found show founder reps in under 15% of 2025–26 Series A deals — almost always capped.',
        },
        { type: 'h', id: 'a2-h4', text: 'Fallback position' },
        {
          type: 'p',
          id: 'a2-p3',
          text: 'If Meridian insists, accept founder reps limited to **capitalization and IP ownership**, capped at **25% of each founder’s proceeds** in a later exit, with no joint liability.',
        },
      ],
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'file',
      label: 'Meridian_TS_v4_section9_redline',
      url: '',
      fileMeta: 'Document · DOCX · tracked changes',
      openWith: 'Open in Pages',
    },

    {
      id: nextId(),
      role: 'user',
      text: 'Last one: compare all this against Northwind’s 2025 SAFE (attached). Will the SAFE holders be diluted more than they expect?',
      attachments: [{ name: 'Northwind_SAFE_2025.pdf', meta: 'PDF · 6 pages' }],
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'files',
      label: 'List files',
      url: '',
      output: {
        type: 'files',
        items: [
          { name: 'Series A', meta: 'Folder · 6 items', folder: true },
          { name: 'Meridian_TermSheet_v4.pdf', meta: 'PDF · 12 pages · today' },
          { name: 'Northwind_SAFE_2025.pdf', meta: 'PDF · 6 pages · today' },
          { name: 'Cap_table_Q3.xlsx', meta: 'Spreadsheet · last week' },
          { name: 'Meridian_TS_v4_section9_redline.docx', meta: 'Document · today' },
        ],
      },
    },
    {
      id: nextId(),
      role: 'tool',
      kind: 'command',
      label: 'Run command',
      url: 'pdftotext "Northwind_SAFE_2025.pdf" -',
      output: {
        type: 'command',
        command: 'pdftotext "Northwind_SAFE_2025.pdf" -',
        cwd: '~/Clients/Northwind/Series A',
        result:
          '{"exitCode":0,"stdout":"POST-MONEY SAFE (SIMPLE AGREEMENT FOR FUTURE EQUITY)… Post-Money Valuation Cap: $20,000,000. Discount Rate: 100%. Purchase Amount: see Schedule 1…"}',
      },
    },
    {
      id: nextId(),
      role: 'answer',
      blocks: [
        { type: 'h', id: 'a3-h1', text: 'How the SAFE converts' },
        {
          type: 'p',
          id: 'a3-p1',
          text: 'The 2025 SAFEs are **post-money SAFEs** with a **$20M valuation cap** and no discount — $2.4M raised from 14 holders. At Meridian’s $62M pre-money they convert at the cap, not at the round price.',
        },
        { type: 'h', id: 'a3-h2', text: 'Dilution at a glance' },
        {
          type: 'ul',
          id: 'a3-l1',
          items: [
            { id: 'a3-l1-1', text: 'SAFE holders own **12.0%** right before the Series A — fixed by the post-money cap.' },
            { id: 'a3-l1-2', text: 'After the round and the pool top-up they hold about **8.6%**. That’s expected dilution.' },
            { id: 'a3-l1-3', text: 'The founders go from roughly **73% to 52%**.' },
          ],
        },
        { type: 'h', id: 'a3-h3', text: 'The pre-money vs. post-money catch' },
        {
          type: 'p',
          id: 'a3-p2',
          text: 'Because the SAFEs are post-money, their 12% is locked in **before** the pool top-up. The 12% option pool is carved out of the pre-money, so the founders absorb the whole top-up — the SAFE holders don’t. Many founders only notice when the cap table comes back.',
        },
        {
          type: 'p',
          id: 'a3-p3',
          text: 'In other words, the SAFE holders are diluted **less** than they might expect, and the founders more. That’s worth a sentence to the board before signing.',
        },
        { type: 'h', id: 'a3-h4', text: 'Language for the closing memo' },
        {
          type: 'quote',
          id: 'a3-q1',
          text: '“The Company’s outstanding post-money SAFEs (aggregate purchase amount $2.4M, valuation cap $20M) will convert into Series A Preferred at the cap. The option pool increase to 12% is included in the pre-money capitalization.”',
        },
        {
          type: 'p',
          id: 'a3-p4',
          text: 'I can turn all three answers into one memo for the partners, with the issues list for Meridian attached — I just need your OK to write the file.',
        },
      ],
    },
    {
      id: nextId(),
      role: 'action',
      label: 'Write file',
      detail: 'Series_A_memo_for_partners.docx',
      path: '~/Clients/Northwind/Series A/Series_A_memo_for_partners.docx',
      summary: '3 sections · about 1,200 words · issues list for Meridian attached',
      fileTitle: 'Series_A_memo_for_partners',
      fileMeta: 'Document · DOCX',
      openWith: 'Open in Pages',
    },
  ]
}

// Opening any chat from the sidebar (Projects/Recents) shows this same
// thread — there's no per-chat content behind each row, just the demo.
export function buildDefaultChatThread(): ChatMessage[] {
  return legalThread()
}

/** plain text of a block, without the **bold** markers */
export function plainText(text: string) {
  return text.replace(/\*\*/g, '')
}
