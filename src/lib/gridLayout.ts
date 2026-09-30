// A tiny dashboard grid engine — just enough for the Home widgets:
// fixed column count, integer cells, vertical gravity (everything floats up
// until it hits something), and "push down" when a moved item lands on others.

export type GridItem = { id: string; x: number; y: number; w: number; h: number }

export function collides(a: GridItem, b: GridItem) {
  if (a.id === b.id) return false
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function firstCollision(placed: GridItem[], item: GridItem) {
  return placed.find((p) => collides(p, item))
}

export function bottom(layout: GridItem[]) {
  return layout.reduce((max, i) => Math.max(max, i.y + i.h), 0)
}

function sortByPosition<T extends GridItem>(layout: T[]) {
  return [...layout].sort((a, b) => a.y - b.y || a.x - b.x)
}

/**
 * Settle every item: float up as far as it can, then get pushed below
 * anything it still overlaps. `pinnedId` (the item being dragged/resized)
 * stays exactly where it is and everything else flows around it.
 */
export function compact<T extends GridItem>(layout: T[], pinnedId?: string): T[] {
  const placed: T[] = []
  const pinned = pinnedId ? layout.find((i) => i.id === pinnedId) : undefined
  if (pinned) placed.push({ ...pinned })

  for (const original of sortByPosition(layout)) {
    if (original.id === pinnedId) continue
    const item = { ...original, y: Math.max(0, original.y) }
    while (item.y > 0 && !firstCollision(placed, { ...item, y: item.y - 1 })) item.y -= 1
    let hit = firstCollision(placed, item)
    while (hit) {
      item.y = hit.y + hit.h
      hit = firstCollision(placed, item)
    }
    placed.push(item)
  }

  // keep the caller's ordering so React keys stay stable
  return layout.map((i) => placed.find((p) => p.id === i.id)!)
}

/**
 * Preview while dragging or resizing: pin the active item at `next`, let the
 * rest reflow around it, then let the active item itself float up into any
 * space it left behind (so the drop shadow shows where it will really land).
 */
export function arrange<T extends GridItem>(start: T[], activeId: string, next: Partial<GridItem>, cols = 4, swap = false): T[] {
  const origin = start.find((i) => i.id === activeId)!
  const moved = { ...origin, ...next }
  let layout = start.map((i) => (i.id === activeId ? moved : i))

  // Dropping onto another widget trades places with it when it fits in the
  // spot we just left — feels far more natural than shoving it downwards.
  if (swap) {
    const placed: GridItem[] = [moved]
    const settled = layout.filter((i) => i.id !== activeId && !collides(i, moved))
    placed.push(...settled)
    layout = layout.map((item) => {
      if (item.id === activeId || !collides(item, moved)) return item
      const dx = moved.x - origin.x
      const dy = moved.y - origin.y
      const candidates = [
        // true swap: into the spot the dragged widget left
        { x: origin.x, y: item.y },
        { x: item.x - dx, y: item.y - dy },
        { x: origin.x, y: origin.y },
        { x: item.x - dx, y: item.y },
        // wider than that spot: slide alongside the dragged widget instead
        { x: moved.x + moved.w, y: item.y },
        { x: moved.x - item.w, y: item.y },
      ]
      for (const c of candidates) {
        const trial = { ...item, x: c.x, y: Math.max(0, c.y) }
        if (trial.x < 0 || trial.x + trial.w > cols) continue
        if (placed.some((p) => collides(p, trial))) continue
        placed.push(trial)
        return trial
      }
      return item
    })
  }

  layout = compact(layout, activeId)

  for (let pass = 0; pass < 3; pass += 1) {
    const active = layout.find((i) => i.id === activeId)!
    const others = layout.filter((i) => i.id !== activeId)
    let y = active.y
    while (y > 0 && !firstCollision(others, { ...active, y: y - 1 })) y -= 1
    if (y === active.y) break
    layout = compact(
      layout.map((i) => (i.id === activeId ? { ...i, y } : i)),
      activeId,
    )
  }

  return compact(layout, activeId)
}

/** First free spot, scanning row by row, for a new w×h item. */
export function findSpot(layout: GridItem[], w: number, h: number, cols: number, prefer?: { x: number; y: number }) {
  const width = Math.min(w, cols)
  if (prefer) {
    const candidate = { id: '__new', x: Math.min(prefer.x, cols - width), y: prefer.y, w: width, h }
    if (!layout.some((i) => collides(i, candidate))) return { x: candidate.x, y: candidate.y }
  }
  for (let y = 0; y < 200; y += 1) {
    for (let x = 0; x <= cols - width; x += 1) {
      const candidate = { id: '__new', x, y, w: width, h }
      if (!layout.some((i) => collides(i, candidate))) return { x, y }
    }
  }
  return { x: 0, y: bottom(layout) }
}
