export type ChatEntry = { id: string; label: string }

export type HistoryItem =
  | { type: 'chat'; id: string; label: string }
  | { type: 'folder'; id: string; name: string; conversations: ChatEntry[] }

// Seed content written as if this workspace belongs to a lawyer / accountant /
// finance person — matches the kind of client & matter-based folders that
// audience actually works with, rather than generic placeholder text.
export const starredHistory: HistoryItem[] = [
  {
    type: 'folder',
    id: 'f1',
    name: 'Meridian Capital — Term Sheet',
    conversations: [
      { id: 'f1a', label: 'Redline the indemnification clause' },
      { id: 'f1b', label: "Compare against last round's SAFE terms" },
    ],
  },
  { type: 'chat', id: 's1', label: 'Summarizing the audit committee minutes' },
  { type: 'chat', id: 's2', label: 'Calculating quarterly estimated tax payments' },
  {
    type: 'folder',
    id: 'f2',
    name: 'Q3 Close',
    conversations: [
      { id: 'f2a', label: 'Reconcile accrued liabilities' },
      { id: 'f2b', label: 'Draft variance commentary for the board deck' },
    ],
  },
  { type: 'chat', id: 's3', label: 'Drafting the engagement letter for a new client' },
]

export const recentsHistory: HistoryItem[] = [
  { type: 'chat', id: 'r1', label: 'Explaining the new lease accounting standard' },
  {
    type: 'folder',
    id: 'f3',
    name: 'Anderson Estate — Probate',
    conversations: [
      { id: 'f3a', label: 'Draft the petition for probate' },
      { id: 'f3b', label: 'List of known creditors and claims' },
    ],
  },
  {
    type: 'folder',
    id: 'f4',
    name: 'Client Onboarding — Chen LLC',
    conversations: [
      { id: 'f4a', label: 'KYC checklist and required documents' },
      { id: 'f4b', label: 'First-year bookkeeping setup notes' },
    ],
  },
  { type: 'chat', id: 'r2', label: 'Reviewing the vendor contract for late-payment terms' },
  { type: 'chat', id: 'r3', label: 'Preparing the 1099 filing checklist' },
  { type: 'chat', id: 'r4', label: 'Summarizing the depreciation schedule changes' },
]
