import { useCallback, useEffect, useState } from 'react'
import { validateBackup } from './domain.mjs'
import { words } from './data'

export type Route = 'today' | 'practice' | 'review' | 'library' | 'writing' | 'settings'
export type History = { id: string; promptId: string; text: string; original: string; at: number }
export type State = {
  version: 1
  seen: Record<string, { firstSeen: number; lastSeen: number; count: number }>
  reviewed: Record<string, { at: number; correct: boolean }>
  saved: string[]
  sessions: { id: string; type: 'typing' | 'review' | 'writing'; at: number; count: number }[]
  drafts: Record<string, { text: string; at: number }>
  writingHistory: History[]
  settings: {
    goal: number
    target: string
    theme: 'light' | 'dark' | 'system'
    accent: 'en-GB' | 'en-US'
    autoAudio: boolean
  }
  onboarded: boolean
}
export const STORAGE_KEY = 'wordloom.local.v1'
export function initialState(): State {
  return {
    version: 1,
    seen: {},
    reviewed: {},
    saved: [],
    sessions: [],
    drafts: {},
    writingHistory: [],
    settings: { goal: 20, target: '7.0', theme: 'light', accent: 'en-GB', autoAudio: false },
    onboarded: false,
  }
}
function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw
      ? (validateBackup(
          JSON.parse(raw),
          words.map((w) => w.id),
        ) as State)
      : initialState()
  } catch {
    return initialState()
  }
}
export function useStore(onError: (message: string) => void) {
  const [state, setState] = useState<State>(loadState)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      onError('此设备无法保存数据，请导出记录以免丢失。')
    }
  }, [state, onError])
  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue || event.newValue.length > 5_000_000) return
      try {
        setState(
          validateBackup(
            JSON.parse(event.newValue),
            words.map((w) => w.id),
          ) as State,
        )
      } catch {
        // An invalid external write must not replace the active learning record.
      }
    }
    window.addEventListener('storage', receive)
    return () => window.removeEventListener('storage', receive)
  }, [])
  const markSeen = useCallback(
    (id: string) =>
      setState((prev) => {
        const now = Date.now(),
          old = prev.seen[id]
        return {
          ...prev,
          seen: {
            ...prev.seen,
            [id]: { firstSeen: old?.firstSeen || now, lastSeen: now, count: (old?.count || 0) + 1 },
          },
        }
      }),
    [],
  )
  const toggleSaved = useCallback(
    (id: string) =>
      setState((prev) => ({
        ...prev,
        saved: prev.saved.includes(id) ? prev.saved.filter((x) => x !== id) : [...prev.saved, id],
      })),
    [],
  )
  const saveDraft = useCallback(
    (id: string, text: string) =>
      setState((prev) => ({ ...prev, drafts: { ...prev.drafts, [id]: { text, at: Date.now() } } })),
    [],
  )
  const addSession = useCallback(
    (type: 'typing' | 'review' | 'writing', count: number) =>
      setState((prev) => ({
        ...prev,
        sessions: [...prev.sessions, { id: crypto.randomUUID(), type, count, at: Date.now() }].slice(-3000),
      })),
    [],
  )
  return { state, setState, markSeen, toggleSaved, saveDraft, addSession }
}
export type Store = ReturnType<typeof useStore>
export function navigate(route: Route) {
  window.location.hash = '/' + route
}
export function useRoute(): Route {
  const get = () => {
    const route = window.location.hash.replace(/^#\//, '').split('?')[0]
    return ['today', 'practice', 'review', 'library', 'writing', 'settings'].includes(route)
      ? (route as Route)
      : 'today'
  }
  const [route, setRoute] = useState<Route>(get)
  useEffect(() => {
    const handler = () => {
      setRoute(get())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  return route
}
export function shortDate(at: number) {
  return new Date(at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}
export function timeAgo(at: number) {
  const days = Math.floor((Date.now() - at) / 86400000)
  return days === 0 ? '今天见过' : days === 1 ? '昨天见过' : `${days} 天前见过`
}
