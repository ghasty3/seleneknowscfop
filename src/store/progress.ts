// Progreso del usuario por algoritmo: 3 niveles elegibles + watchlist + tiempos del cronómetro.
import { useSyncExternalStore } from 'react'

export type Level = 0 | 33 | 66 | 100

export interface ProgressEntry {
  level: Level
  watched: boolean
  times: number[] // ms, orden de registro (último al final)
  best: number // ms
  updatedAt: number
}

type Store = Record<string, ProgressEntry>

const KEY = 'cubo.cfop.progress.v2'

let store: Store = load()
const listeners = new Set<() => void>()

function blank(): ProgressEntry {
  return { level: 0, watched: false, times: [], best: 0, updatedAt: 0 }
}

function load(): Store {
  const read = (k: string): Record<string, Partial<ProgressEntry>> => {
    try {
      const raw = localStorage.getItem(k)
      const parsed = raw ? ({ ...(JSON.parse(raw) as object) } as Record<string, Partial<ProgressEntry>>) : null
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }
  const v2 = read(KEY)
  const v1 = read('cubo.cfop.progress.v1') // migración desde la primera versión
  const out: Store = {}
  for (const [id, e] of [...Object.entries(v1), ...Object.entries(v2)]) {
    const prev = out[id] ?? blank()
    out[id] = {
      ...prev,
      level: (e.level as Level) ?? prev.level,
      watched: e.watched ?? prev.watched,
      times: Array.isArray(e.times) ? e.times : prev.times,
      best: typeof e.best === 'number' ? e.best : prev.best,
      updatedAt: e.updatedAt ?? prev.updatedAt,
    }
  }
  return out
}

function emit() {
  for (const l of listeners) l()
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* modo privado / sin storage: seguimos en memoria */
  }
}

function patch(id: string, p: Partial<ProgressEntry>) {
  const prev = store[id] ?? blank()
  const next = { ...prev, ...p, updatedAt: Date.now() }
  if (next.level === 0 && !next.watched && next.times.length === 0) delete store[id]
  else store[id] = next
  persist()
  emit()
}

const MAX_TIMES = 40

export const progress = {
  setLevel: (id: string, level: Level) => patch(id, { level }),
  toggleWatch: (id: string) => {
    const prev = store[id]
    patch(id, { watched: !(prev?.watched ?? false) })
  },
  setWatch: (id: string, watched: boolean) => patch(id, { watched }),
  recordTime: (id: string, ms: number) => {
    const prev = store[id] ?? blank()
    const times = [...prev.times, Math.round(ms)].slice(-MAX_TIMES)
    const best = prev.best ? Math.min(prev.best, ms) : Math.round(ms)
    patch(id, { times, best })
  },
  clearTimes: (id: string) => patch(id, { times: [], best: 0 }),
  resetAll: () => {
    store = {}
    persist()
    emit()
  },
  get: (id: string) => store[id],
  subscribe(cb: () => void) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
  snapshot: () => store,
}

export function useProgress(id: string) {
  const all = useSyncExternalStore(progress.subscribe, progress.snapshot, progress.snapshot)
  const entry = all[id] ?? blank()
  return {
    ...entry,
    setLevel: (l: Level) => progress.setLevel(id, l),
    toggleWatch: () => progress.toggleWatch(id),
    recordTime: (ms: number) => progress.recordTime(id, ms),
    clearTimes: () => progress.clearTimes(id),
  }
}

export function useAllProgress(): Store {
  return useSyncExternalStore(progress.subscribe, progress.snapshot, progress.snapshot)
}

export function useStore() {
  return useSyncExternalStore(progress.subscribe, progress.snapshot, progress.snapshot)
}

export const LEVEL_LABEL: Record<Level, string> = {
  0: 'Sin empezar',
  33: 'Aprendido',
  66: 'Automático',
  100: 'Fingertricks',
}

export const LEVEL_HINT: Record<Level, string> = {
  0: 'Toca un nivel cuando empieces con este algoritmo.',
  33: '33% — reconoces el caso y sabes el algoritmo, pero aún piensas cada movimiento.',
  66: '66% — lo ejecutas solo, de forma automática, mirando el cubo.',
  100: '100% — dominas el algoritmo y todos sus fingertricks.',
}

export function fmtTime(ms: number): string {
  if (!ms) return '—'
  const s = ms / 1000
  if (s < 60) return s.toFixed(2)
  const m = Math.floor(s / 60)
  const rest = s - m * 60
  return `${m}:${rest.toFixed(2).padStart(5, '0')}`
}

export function avg(times: number[]): number {
  if (!times.length) return 0
  return times.reduce((a, b) => a + b, 0) / times.length
}
