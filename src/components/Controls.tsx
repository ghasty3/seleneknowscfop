import { useCallback, useEffect, useRef, useState } from 'react'
import { Cube3D } from './Cube3D'
import { applyMoves, cloneState, parseAlg, scramble as makeScramble, solvedState, type CubeState } from '../cube/engine'
import { avg, fmtTime, LEVEL_HINT, LEVEL_LABEL, progress, useAllProgress, useProgress, type Level } from '../store/progress'
import { StarIcon } from './icons'
import { caseRefs } from '../data/stages'
import type { StageKey } from '../data/types'

export { avg, fmtTime, LEVEL_HINT, LEVEL_LABEL } from '../store/progress'

export const LEVELS: Level[] = [0, 33, 66, 100]

export function LevelBar({ id, compact = false }: { id: string; compact?: boolean }) {
  const p = useProgress(id)
  return (
    <div className={`levelbar${compact ? ' compact' : ''}`} role="group" aria-label="Nivel del algoritmo">
      {[33, 66, 100].map((l) => (
        <button
          key={l}
          className={`lvl lvl-${l}${p.level === l ? ' on' : ''}`}
          onClick={() => p.setLevel(p.level === l ? 0 : (l as Level))}
          aria-pressed={p.level === l}
          title={LEVEL_HINT[l as Level]}
        >
          {compact ? `${l}%` : LEVEL_LABEL[l as Level]}
        </button>
      ))}
    </div>
  )
}

export function Star({ id }: { id: string }) {
  const p = useProgress(id)
  return (
    <button
      className={`star${p.watched ? ' on' : ''}`}
      onClick={p.toggleWatch}
      aria-pressed={p.watched}
      title={p.watched ? 'Quitar de mi lista' : 'Guardar en mi lista'}
    >
      <StarIcon filled={p.watched} />
      <span className="sr-only">{p.watched ? 'Quitar de mi lista' : 'Guardar en mi lista'}</span>
    </button>
  )
}

/** Barra de progreso de una fase: casos marcados (nivel > 0 o en la lista). */
export function StageProgress({ stage, label }: { stage: StageKey; label?: string }) {
  const all = useAllProgress()
  const refs = caseRefs(stage)
  const done = refs.filter((r) => {
    const e = all[r.id]
    return !!e && (e.level > 0 || e.watched)
  }).length
  if (!refs.length) return null
  return (
    <div className="stage-progress">
      <div className="progress">
        <div className="progress-bar" style={{ width: `${(done / refs.length) * 100}%` }} />
      </div>
      <span className="stage-progress-label">
        {label ?? 'Marcados'}: {done} de {refs.length}
      </span>
    </div>
  )
}

/** Box de barajado: scramble legible, aplicable al cubo y copiable. */
export function ScrambleBox({
  onApply,
  disabled,
  factory,
}: {
  onApply: (scr: string) => void
  disabled?: boolean
  factory?: () => string
}) {
  const [scr, setScr] = useState('')
  const [copied, setCopied] = useState(false)
  const generate = () => {
    const s = factory ? factory() : makeScramble()
    setScr(s)
    onApply(s)
  }
  useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="scramble-box">
      <code className="scramble">{scr || 'pulsa barajear'}</code>
      <div className="row">
        <button className="btn" onClick={generate} disabled={disabled}>
          Barajear
        </button>
        <button
          className="btn"
          disabled={!scr}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(scr)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            } catch {
              setCopied(false)
            }
          }}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

export type TrainerMode = 'cross' | 'pair' | 'full'

const MODE_TEXT: Record<TrainerMode, { goal: string; timerId: string }> = {
  cross: {
    goal: 'Barajea, resuelve solo la cruz y para el cronómetro. La cruz completa y bien orientada es la base de todo el método.',
    timerId: 'timer:cross',
  },
  pair: {
    goal: 'Barajea solo un par (esquina + arista blancas arriba, hueco libre), resuelve ese par y para. El resto del cubo queda intacto, así que puedes repetir sin rehacer el plantado.',
    timerId: 'timer:f2l',
  },
  full: {
    goal: 'Inspección de 15 s, resolución completa y cronómetro: cruz, F2L, OLL y PLL seguidos.',
    timerId: 'timer:full',
  },
}

function pairScramble(): string {
  // barajado interno del grupo de pares de F2L: deja el par arriba con el hueco libre
  const refs = caseRefs('f2l').filter((r) => r.def.expect === 'f2l-top')
  const pick = refs[Math.floor(Math.random() * refs.length)]
  if (!pick) return makeScramble()
  const setup = makeScramble(5, Math.floor(Math.random() * 1e9))
  return `${pick.def.algs[0]} ${setup}`
}

function applyMoveSafe(s: CubeState, face: string): CubeState {
  const out = cloneState(s)
  applyMoves(out, parseAlg(face))
  return out
}

/**
 * Entrenador con cronómetro (inspección de 15 s) y barra grande accionada con
 * la barra espaciadora, al estilo de los speedcubers.
 */
export function SolveTrainer({ mode = 'full' }: { mode?: TrainerMode }) {
  const [state, setState] = useState<CubeState>(() => solvedState())
  const [phase, setPhase] = useState<'idle' | 'inspection' | 'running' | 'stopped'>('idle')
  const [ms, setMs] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [inspection, setInspection] = useState(mode === 'full')
  const startRef = useRef(0)
  const tickRef = useRef<number | null>(null)
  const inspRef = useRef<number | null>(null)

  const stopTick = () => {
    if (tickRef.current !== null) window.clearInterval(tickRef.current)
    tickRef.current = null
    if (inspRef.current !== null) window.clearInterval(inspRef.current)
    inspRef.current = null
  }

  const timerId = MODE_TEXT[mode].timerId

  const applyScramble = useCallback(
    (s: string) => {
      const st = solvedState()
      applyMoves(st, parseAlg(s))
      setState(st)
      setPhase('idle')
      setMs(0)
      stopTick()
    },
    [],
  )

  useEffect(() => () => stopTick(), [])

  const beginRun = useCallback(() => {
    startRef.current = performance.now()
    setPhase('running')
    setMs(0)
    if (tickRef.current !== null) window.clearInterval(tickRef.current)
    tickRef.current = window.setInterval(() => setMs(performance.now() - startRef.current), 71)
  }, [])

  const begin = useCallback(() => {
    stopTick()
    startRef.current = performance.now()
    setMs(0)
    if (inspection) {
      setPhase('inspection')
      let left = 15
      inspRef.current = window.setInterval(() => {
        left -= 1
        setMs((15 - left) * 1000)
        if (left <= 0) {
          if (inspRef.current !== null) window.clearInterval(inspRef.current)
          inspRef.current = null
          beginRun()
        }
      }, 1000)
    } else {
      beginRun()
    }
  }, [inspection, beginRun])

  const finish = useCallback(() => {
    const t = performance.now() - startRef.current
    stopTick()
    setPhase('stopped')
    setMs(t)
    setTimes((prev) => {
      const next = [...prev, t].slice(-10)
      progress.recordTime(timerId, t)
      return next
    })
  }, [timerId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        if (phase === 'idle' || phase === 'stopped') begin()
        else if (phase === 'inspection') {
          stopTick()
          beginRun()
        } else if (phase === 'running') finish()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, begin, finish, beginRun])

  const factory = mode === 'pair' ? pairScramble : undefined

  return (
    <div className="trainer">
      <p className="lead">{MODE_TEXT[mode].goal}</p>
      <div className="trainer-top">
        <ScrambleBox onApply={applyScramble} disabled={phase === 'running' || phase === 'inspection'} factory={factory} />
        <label className="check">
          <input type="checkbox" checked={inspection} onChange={(e) => setInspection(e.target.checked)} />
          inspección de 15 s
        </label>
      </div>
      <div className="trainer-grid">
        <div className="trainer-cube">
          <Cube3D state={state} size={230} onFaceClick={(face) => setState((prev) => applyMoveSafe(prev, face))} />
          <p className="hint">
            Pulsa una pegatina para girar esa cara: el cubo se mueve de verdad, sin fórmulas, que es como se aprende.
          </p>
        </div>
        <div className="timer-col">
          <div
            className={`timer timer-${phase}`}
            onClick={() => (phase === 'running' ? finish() : begin())}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (phase === 'running' ? finish() : begin())
            }}
          >
            <span className="timer-value">{fmtTime(ms)}</span>
            <span className="timer-hint">
              {phase === 'idle' && (inspection ? 'Espacio: inspección' : 'Espacio: empezar')}
              {phase === 'inspection' && 'Espacio: paro de inspección'}
              {phase === 'running' && 'Espacio: parar'}
              {phase === 'stopped' && 'Espacio: nueva resolución'}
            </span>
          </div>
          <div className="row">
            <button className="btn" onClick={() => applyScramble(factory ? factory() : makeScramble())}>
              Nueva barajada
            </button>
            {phase === 'running' && (
              <button className="btn primary" onClick={finish}>
                Parar
              </button>
            )}
          </div>
          <div className="times">
            {times.length === 0 && <p className="hint">Aún sin tiempos en esta sesión.</p>}
            {times.length > 0 && (
              <>
                <p className="hint">
                  mejor {fmtTime(Math.min(...times))} · media {fmtTime(avg(times))} · {times.length} resoluciones
                </p>
                <ol className="times-list">
                  {times
                    .slice()
                    .reverse()
                    .map((t, i) => (
                      <li key={i}>{fmtTime(t)}</li>
                    ))}
                </ol>
                <p className="row">
                  <button className="btn" onClick={() => progress.clearTimes(timerId)}>
                    Borrar tiempos guardados
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
