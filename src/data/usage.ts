// Plans + usage limits shown in the top bar ring, its popover and the banner
// above the input. Copy and reset times are placeholders — match them to the
// real limits once they're final.

export type PlanId = 'free' | 'starter' | 'professional' | 'max'

/** what the demo's usage is doing — the ring always shows today's limit */
export type UsageLevel = 'normal' | 'pace' | 'near' | 'reached'

export type UsageTone = 'normal' | 'near' | 'reached'

type Plan = {
  name: string
  short: string
  price?: string
  /** the plan an upsell points to */
  next?: PlanId
  /** how much more this plan gives than the one below it */
  boost?: string
}

export const plans: Record<PlanId, Plan> = {
  free: { name: 'Free plan', short: 'Free', next: 'starter' },
  starter: { name: 'Starter', short: 'Starter', price: '$20 / month', next: 'professional' },
  professional: { name: 'Professional', short: 'Pro', price: '$50 / month', next: 'max', boost: '3×' },
  max: { name: 'Max', short: 'Max', price: '$100 / month', boost: '4×' },
}

export const planOrder: PlanId[] = ['free', 'starter', 'professional', 'max']

export type Meter = { label: string; reset: string; pct: number }

export type UsageSnapshot = { today: Meter; week: Meter; billing: Meter }

export const usageByLevel: Record<UsageLevel, UsageSnapshot> = {
  normal: {
    today: { label: 'Today', reset: 'Resets in 13h 2m', pct: 30 },
    week: { label: 'This week', reset: 'Resets Monday', pct: 18 },
    billing: { label: 'This billing period', reset: 'Resets Oct 31', pct: 12 },
  },
  pace: {
    today: { label: 'Today', reset: 'Resets in 13h 2m', pct: 30 },
    week: { label: 'This week', reset: 'Resets Monday', pct: 50 },
    billing: { label: 'This billing period', reset: 'Resets Oct 31', pct: 24 },
  },
  near: {
    today: { label: 'Today', reset: 'Resets in 4h 12m', pct: 75 },
    week: { label: 'This week', reset: 'Resets Monday', pct: 18 },
    billing: { label: 'This billing period', reset: 'Resets Oct 31', pct: 12 },
  },
  reached: {
    today: { label: 'Today', reset: 'Resets at 10:00 PM', pct: 100 },
    week: { label: 'This week', reset: 'Resets Monday', pct: 41 },
    billing: { label: 'This billing period', reset: 'Resets Oct 31', pct: 22 },
  },
}

/** used for the paused input and the 100% banner */
export const RESET_TIME = '10:00 PM'

/** neutral under 70%, amber 70–99%, red at 100% */
export function toneOf(pct: number): UsageTone {
  if (pct >= 100) return 'reached'
  if (pct >= 70) return 'near'
  return 'normal'
}

/** "$50 / month" → "$50 per month" */
export function pricePhrase(id: PlanId) {
  return plans[id].price?.replace(' / ', ' per ') ?? ''
}

/** label of the upgrade link: Free → "Upgrade", paid → "Get <next plan>", top plan → none */
export function upgradeLabel(plan: PlanId) {
  const next = plans[plan].next
  if (!next) return null
  return plan === 'free' ? 'Upgrade' : `Get ${plans[next].name}`
}
