/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Context, type ReactNode } from 'react'
import {
  GRID_COLS,
  allWidgets,
  defaultPlaceholders,
  defaultSize,
  fewWidgets,
  isTool,
  kindName,
  newWidgetId,
  placeholderMeta,
  presets,
  seedWorkspaces,
  sourceTool,
  tintOrder,
  tools,
  widgetContent,
  type Placeholder,
  type ToolId,
  type Widget,
  type WidgetKind,
  type Workspace,
} from '../data/dashboard'
import { buildDefaultChatThread, genericReply, nextId, scriptedReplies, type ChatMessage } from '../data/messages'
import { compact, findSpot, type GridItem } from '../lib/gridLayout'

// Bump when the persisted shape changes — older saves are dropped, not migrated.
const STORAGE_KEY = 'wisp-prototype'
const VERSION = 3

export type View = 'home' | 'chat'
export type Scenario = 'empty' | 'few' | 'all'

export type ProtoState = {
  version: number
  view: View
  /** one open/closed state for the left nav — it stays put when you switch Dashboard ↔ Chat */
  sidebarOpen: boolean
  updatesOpen: boolean
  activeWorkspaceId: string
  workspaces: Workspace[]
  feedBadge: number
  chat: { started: boolean; messages: ChatMessage[] }
}

export type Toast = { id: number; text: string; actionLabel?: string; onAction?: () => void }

function initialState(): ProtoState {
  return {
    version: VERSION,
    view: 'home',
    sidebarOpen: false,
    updatesOpen: false,
    activeWorkspaceId: 'home',
    workspaces: seedWorkspaces(),
    feedBadge: 4,
    chat: { started: false, messages: [] },
  }
}

function loadState(): ProtoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ProtoState & { sidebar?: Record<View, boolean> }
      if (parsed?.version === VERSION && Array.isArray(parsed.workspaces) && parsed.workspaces.length) {
        const base = initialState()
        // older saves kept a per-view flag; carry over whatever the current view had
        const { sidebar, ...rest } = parsed
        return {
          ...base,
          ...rest,
          sidebarOpen: rest.sidebarOpen ?? sidebar?.[rest.view] ?? false,
          activeWorkspaceId: parsed.workspaces.some((w) => w.id === parsed.activeWorkspaceId)
            ? parsed.activeWorkspaceId
            : parsed.workspaces[0].id,
        }
      }
    }
  } catch {
    // private mode / corrupted JSON — fall back to a fresh prototype
  }
  return initialState()
}

function saveState(state: ProtoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked — the prototype still works, it just won't persist
  }
}

function applyLayout<T extends GridItem>(items: T[], layout: GridItem[]): T[] {
  return items.map((item) => {
    const next = layout.find((l) => l.id === item.id)
    return next ? { ...item, x: next.x, y: next.y, w: next.w, h: next.h } : item
  })
}

/** tools that have at least one widget in the workspace */
export function connectedTools(ws: Workspace): Set<ToolId> {
  const set = new Set<ToolId>()
  ws.widgets.forEach((w) => {
    const tool = sourceTool(w)
    if (tool) set.add(tool)
  })
  return set
}

/** name of another workspace where this tool is already connected, if any */
export function connectedElsewhere(workspaces: Workspace[], wsId: string, tool: ToolId) {
  return workspaces.find((w) => w.id !== wsId && connectedTools(w).has(tool))
}

type AddOptions = { preset?: string; prompt?: string; at?: { x: number; y: number }; scope?: string[]; silent?: boolean }

function useProtoValue() {
  const [state, setState] = useState<ProtoState>(loadState)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [connecting, setConnecting] = useState<Record<string, boolean>>({})
  const [freshIds, setFreshIds] = useState<Record<string, boolean>>({})
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})
  const chatTimers = useRef<number[]>([])
  const connectingRef = useRef<Record<string, boolean>>({})
  const stateRef = useRef(state)
  stateRef.current = state

  // persist (lightly debounced — drags fire many layout updates)
  useEffect(() => {
    const t = window.setTimeout(() => saveState(state), 150)
    return () => window.clearTimeout(t)
  }, [state])

  useEffect(() => () => chatTimers.current.forEach((t) => window.clearTimeout(t)), [])

  const patchWorkspace = useCallback((wsId: string, fn: (ws: Workspace) => Workspace) => {
    setState((s) => ({ ...s, workspaces: s.workspaces.map((w) => (w.id === wsId ? fn(w) : w)) }))
  }, [])

  const toast = useCallback((text: string, actionLabel?: string, onAction?: () => void) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list.slice(-2), { id, text, actionLabel, onAction }])
    // undo-able toasts stay a bit longer so there's time to change your mind
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), onAction ? 8000 : 4500)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const markFresh = useCallback((id: string) => {
    setFreshIds((f) => ({ ...f, [id]: true }))
    window.setTimeout(
      () =>
        setFreshIds((f) => {
          const next = { ...f }
          delete next[id]
          return next
        }),
      1800,
    )
  }, [])

  /* ------------------------------------------------------------ widgets */

  const addWidget = useCallback(
    (wsId: string, kind: WidgetKind, opts: AddOptions = {}) => {
      const id = newWidgetId(kind)
      const size = defaultSize(kind)
      setState((s) => ({
        ...s,
        workspaces: s.workspaces.map((ws) => {
          if (ws.id !== wsId) return ws
          const spot = findSpot(ws.widgets, size.w, size.h, GRID_COLS, opts.at)
          const widget: Widget = {
            id,
            kind,
            preset: opts.preset ?? presets[kind][0].id,
            x: spot.x,
            y: spot.y,
            w: Math.min(size.w, GRID_COLS),
            h: size.h,
            scope: opts.scope,
            prompt: opts.prompt,
            updatedAt: Date.now(),
          }
          return { ...ws, widgets: compact([...ws.widgets, widget]) }
        }),
      }))
      markFresh(id)
      if (!opts.silent) {
        const ws = stateRef.current.workspaces.find((w) => w.id === wsId)
        toast(`${opts.prompt ? `Custom ${kindName(kind)} view` : kindName(kind)} added to ${ws?.name ?? 'Home'}`)
      }
      return id
    },
    [markFresh, toast],
  )

  /** simulates the OAuth / local read handshake, then drops the widget in */
  const connectTool = useCallback(
    (wsId: string, tool: WidgetKind, opts: AddOptions = {}) => {
      const key = `${wsId}:${tool}`
      if (connectingRef.current[key]) return
      connectingRef.current[key] = true
      setConnecting((c) => ({ ...c, [key]: true }))
      window.setTimeout(() => {
        delete connectingRef.current[key]
        setConnecting((c) => {
          const next = { ...c }
          delete next[key]
          return next
        })
        addWidget(wsId, tool, { ...opts, silent: true })
        const ws = stateRef.current.workspaces.find((w) => w.id === wsId)
        toast(
          isTool(tool)
            ? `${tools[tool].name} connected to ${ws?.name ?? 'Home'} · read on this Mac`
            : `${kindName(tool)} widget created in ${ws?.name ?? 'Home'}`,
        )
      }, 1100)
    },
    [addWidget, toast],
  )

  const updateWidget = useCallback(
    (wsId: string, widgetId: string, patch: Partial<Widget>) => {
      patchWorkspace(wsId, (ws) => ({ ...ws, widgets: ws.widgets.map((w) => (w.id === widgetId ? { ...w, ...patch } : w)) }))
    },
    [patchWorkspace],
  )

  const removeWidget = useCallback(
    (wsId: string, widgetId: string) => {
      const ws = stateRef.current.workspaces.find((w) => w.id === wsId)
      const removed = ws?.widgets.find((w) => w.id === widgetId)
      if (!ws || !removed) return
      const before = ws.widgets
      patchWorkspace(wsId, (current) => ({ ...current, widgets: compact(current.widgets.filter((w) => w.id !== widgetId)) }))
      toast(`${kindName(removed.kind)} removed from ${ws.name}`, 'Undo', () => {
        patchWorkspace(wsId, (current) => ({ ...current, widgets: before }))
        markFresh(removed.id)
      })
    },
    [markFresh, patchWorkspace, toast],
  )

  const setWidgetLayout = useCallback(
    (wsId: string, layout: GridItem[]) => {
      patchWorkspace(wsId, (ws) => ({ ...ws, widgets: applyLayout(ws.widgets, layout) }))
    },
    [patchWorkspace],
  )

  const setPlaceholderLayout = useCallback(
    (wsId: string, layout: GridItem[]) => {
      patchWorkspace(wsId, (ws) => ({ ...ws, placeholders: applyLayout(ws.placeholders, layout) }))
    },
    [patchWorkspace],
  )

  const hidePlaceholder = useCallback(
    (wsId: string, id: Placeholder['id']) => {
      const ws = stateRef.current.workspaces.find((w) => w.id === wsId)
      if (!ws) return
      const before = ws.placeholders
      if (!before.some((p) => p.id === id)) return
      patchWorkspace(wsId, (current) => ({ ...current, placeholders: compact(current.placeholders.filter((p) => p.id !== id)) }))
      toast(`${placeholderMeta[id].name} hidden from ${ws.name}`, 'Undo', () =>
        patchWorkspace(wsId, (current) => ({ ...current, placeholders: before })),
      )
    },
    [patchWorkspace, toast],
  )

  const refreshWidget = useCallback(
    (wsId: string, widgetId: string) => {
      setRefreshing((r) => ({ ...r, [widgetId]: true }))
      window.setTimeout(() => {
        setRefreshing((r) => {
          const next = { ...r }
          delete next[widgetId]
          return next
        })
        updateWidget(wsId, widgetId, { updatedAt: Date.now() })
      }, 900)
    },
    [updateWidget],
  )

  const refreshWorkspace = useCallback(
    (wsId: string) => {
      const ws = stateRef.current.workspaces.find((w) => w.id === wsId)
      if (!ws) return
      setRefreshing((r) => ({ ...r, [wsId]: true, ...Object.fromEntries(ws.widgets.map((w) => [w.id, true])) }))
      window.setTimeout(() => {
        setRefreshing({})
        const now = Date.now()
        patchWorkspace(wsId, (current) => ({
          ...current,
          refreshedAt: now,
          widgets: current.widgets.map((w) => ({ ...w, updatedAt: now })),
        }))
      }, 1000)
    },
    [patchWorkspace],
  )

  const removeAllWidgets = useCallback(
    (wsId: string) => {
      const ws = stateRef.current.workspaces.find((w) => w.id === wsId)
      if (!ws || !ws.widgets.length) return
      const before = ws.widgets
      patchWorkspace(wsId, (current) => ({ ...current, widgets: [] }))
      toast(`Cleared ${ws.name}`, 'Undo', () => patchWorkspace(wsId, (current) => ({ ...current, widgets: before })))
    },
    [patchWorkspace, toast],
  )

  const resetLayout = useCallback(
    (wsId: string) => {
      patchWorkspace(wsId, (ws) => {
        if (!ws.widgets.length) return { ...ws, placeholders: defaultPlaceholders() }
        // re-pack in reading order at each widget's default size
        const packed: Widget[] = []
        ;[...ws.widgets]
          .sort((a, b) => a.y - b.y || a.x - b.x)
          .forEach((w) => {
            const size = defaultSize(w.kind)
            const spot = findSpot(packed, size.w, size.h, GRID_COLS)
            packed.push({ ...w, ...spot, w: size.w, h: size.h })
          })
        return { ...ws, widgets: compact(packed) }
      })
      toast('Layout reset')
    },
    [patchWorkspace, toast],
  )

  /* --------------------------------------------------------- workspaces */

  const selectWorkspace = useCallback((id: string, goHome = true) => {
    setState((s) => ({ ...s, activeWorkspaceId: id, view: goHome ? 'home' : s.view }))
  }, [])

  const createWorkspace = useCallback(
    (name: string) => {
      const clean = name.trim() || 'New workspace'
      const id = `ws-${Date.now().toString(36)}`
      setState((s) => {
        const tint = tintOrder[s.workspaces.length % tintOrder.length]
        const ws: Workspace = {
          id,
          name: clean,
          letter: clean[0].toUpperCase(),
          tint,
          widgets: [],
          placeholders: defaultPlaceholders(),
          refreshedAt: Date.now(),
        }
        return { ...s, workspaces: [...s.workspaces, ws], activeWorkspaceId: id, view: 'home' }
      })
      toast(`${clean} created — widgets you add here stay in ${clean}`)
    },
    [toast],
  )

  const renameWorkspace = useCallback(
    (id: string, name: string) => {
      const clean = name.trim()
      if (!clean) return
      patchWorkspace(id, (ws) => ({ ...ws, name: clean, letter: clean[0].toUpperCase() }))
    },
    [patchWorkspace],
  )

  const deleteWorkspace = useCallback(
    (id: string) => {
      const s = stateRef.current
      const index = s.workspaces.findIndex((w) => w.id === id)
      if (index < 0 || s.workspaces.length < 2) return
      const removed = s.workspaces[index]
      setState((current) => {
        const workspaces = current.workspaces.filter((w) => w.id !== id)
        return {
          ...current,
          workspaces,
          activeWorkspaceId: current.activeWorkspaceId === id ? workspaces[0].id : current.activeWorkspaceId,
        }
      })
      toast(`${removed.name} deleted`, 'Undo', () =>
        setState((current) => {
          const workspaces = [...current.workspaces]
          workspaces.splice(index, 0, removed)
          return { ...current, workspaces, activeWorkspaceId: removed.id }
        }),
      )
    },
    [toast],
  )

  const applyScenario = useCallback(
    (scenario: Scenario) => {
      const wsId = stateRef.current.activeWorkspaceId
      patchWorkspace(wsId, (ws) => ({
        ...ws,
        widgets: scenario === 'empty' ? [] : scenario === 'few' ? fewWidgets() : allWidgets(),
        placeholders: scenario === 'empty' ? defaultPlaceholders() : ws.placeholders,
        refreshedAt: Date.now() - 2 * 60 * 1000,
      }))
      setState((s) => ({ ...s, view: 'home' }))
    },
    [patchWorkspace],
  )

  const resetEverything = useCallback(() => {
    chatTimers.current.forEach((t) => window.clearTimeout(t))
    chatTimers.current = []
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setState(initialState())
    setToasts([])
    toast('Prototype reset — everything is back to the first-run state')
  }, [toast])

  /* ---------------------------------------------------------- navigation */

  const clearChatTimers = () => {
    chatTimers.current.forEach((t) => window.clearTimeout(t))
    chatTimers.current = []
  }

  const later = (fn: () => void, ms: number) => {
    chatTimers.current.push(window.setTimeout(fn, ms))
  }

  const appendMessages = useCallback((messages: ChatMessage[]) => {
    setState((s) => ({ ...s, chat: { started: true, messages: [...s.chat.messages, ...messages] } }))
  }, [])

  const goHome = useCallback(() => setState((s) => ({ ...s, view: 'home' })), [])

  /** Chat button — reopens the last chat, or a new one if there isn't any */
  const goChat = useCallback(() => setState((s) => ({ ...s, view: 'chat' })), [])

  const newChat = useCallback(() => {
    clearChatTimers()
    setState((s) => ({ ...s, view: 'chat', chat: { started: false, messages: [] } }))
  }, [])

  const openThread = useCallback(() => {
    clearChatTimers()
    setState((s) => ({ ...s, view: 'chat', chat: { started: true, messages: buildDefaultChatThread() } }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState((s) => ({ ...s, sidebarOpen: !s.sidebarOpen }))
  }, [])

  const setUpdatesOpen = useCallback((open: boolean) => setState((s) => ({ ...s, updatesOpen: open })), [])

  /** right-rail feed icon → Updates docks on the right of whatever screen you're on */
  const openFeed = useCallback(() => {
    setState((s) => ({ ...s, updatesOpen: true, feedBadge: 0 }))
  }, [])

  /* ---------------------------------------------------------------- chat */

  const sendMessage = useCallback(
    (text: string) => {
      const started = stateRef.current.chat.started
      if (!started) {
        clearChatTimers()
        setState((s) => ({ ...s, view: 'chat', chat: { started: true, messages: [{ id: nextId(), role: 'user', text }] } }))
        scriptedReplies.forEach((reply, index) => later(() => appendMessages([{ ...reply, id: nextId() }]), 700 * (index + 1)))
        return
      }
      appendMessages([{ id: nextId(), role: 'user', text }])
      later(() => appendMessages([{ ...genericReply, id: nextId() }]), 700)
    },
    [appendMessages],
  )

  /** "Ask Wisp …" on a widget — opens a fresh chat with that widget as context */
  const askWisp = useCallback(
    (widget: Widget, question?: string, reply?: string) => {
      clearChatTimers()
      const content = widgetContent(widget)
      const kind = content.source ?? widget.kind
      setState((s) => ({
        ...s,
        view: 'chat',
        chat: {
          started: true,
          messages: [
            { id: nextId(), role: 'context', kinds: [kind], title: kindName(kind), detail: content.headline },
            { id: nextId(), role: 'user', text: question ?? content.cta },
          ],
        },
      }))
      later(() => appendMessages([{ id: nextId(), role: 'wisp', text: reply ?? content.reply }]), 900)
    },
    [appendMessages],
  )

  /** Updates panel outside a chat — opens a fresh chat with the updates attached */
  const startChatWithContext = useCallback(
    (kinds: WidgetKind[], title: string, detail: string, question: string, reply: string) => {
      clearChatTimers()
      setState((s) => ({
        ...s,
        view: 'chat',
        chat: {
          started: true,
          messages: [
            { id: nextId(), role: 'context', kinds, title, detail },
            { id: nextId(), role: 'user', text: question },
          ],
        },
      }))
      later(() => appendMessages([{ id: nextId(), role: 'wisp', text: reply }]), 900)
    },
    [appendMessages],
  )

  /** "Add to this chat" from the Updates panel */
  const addContext = useCallback(
    (kinds: WidgetKind[], title: string, detail: string, reply: string) => {
      appendMessages([{ id: nextId(), role: 'context', kinds, title, detail }])
      later(() => appendMessages([{ id: nextId(), role: 'wisp', text: reply }]), 800)
    },
    [appendMessages],
  )

  const actions = useMemo(
    () => ({
      toast,
      dismissToast,
      addWidget,
      connectTool,
      updateWidget,
      removeWidget,
      setWidgetLayout,
      setPlaceholderLayout,
      hidePlaceholder,
      refreshWidget,
      refreshWorkspace,
      removeAllWidgets,
      resetLayout,
      selectWorkspace,
      createWorkspace,
      renameWorkspace,
      deleteWorkspace,
      applyScenario,
      resetEverything,
      goHome,
      goChat,
      newChat,
      openThread,
      toggleSidebar,
      setUpdatesOpen,
      openFeed,
      sendMessage,
      askWisp,
      addContext,
      startChatWithContext,
    }),
    // every action above is stable (useCallback over setters / refs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const activeWorkspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? state.workspaces[0]

  return { state, activeWorkspace, actions, toasts, connecting, freshIds, refreshing }
}

type ProtoValue = ReturnType<typeof useProtoValue>

// Reuse the same context object across hot reloads so an edit to this file
// doesn't strand already-mounted consumers on a stale context.
const ProtoContext: Context<ProtoValue | null> =
  (import.meta.hot?.data.protoContext as Context<ProtoValue | null> | undefined) ?? createContext<ProtoValue | null>(null)
if (import.meta.hot) import.meta.hot.data.protoContext = ProtoContext

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const value = useProtoValue()
  return <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>
}

export function usePrototype() {
  const value = useContext(ProtoContext)
  if (!value) throw new Error('usePrototype must be used inside <PrototypeProvider>')
  return value
}
