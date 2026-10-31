import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Cube3D } from './Cube3D'
import { Chevron, PauseIcon, PlayIcon } from './icons'
import {
  algToString,
  applyMove,
  cloneState,
  invertMoves,
  mirrorAlg,
  parseAlg,
  solvedState,
  type CubeState,
  type Move,
} from '../cube/engine'

export type Family = 'face' | 'wide' | 'slice' | 'rotation'

export const FAMILY_LABEL: Record<Family, string> = {
  face: 'cara',
  wide: 'ancha',
  slice: 'corte',
  rotation: 'giro',
}

export const FAMILY_COLOR: Record<Family, string> = {
  face: 'fam-face',
  wide: 'fam-wide',
  slice: 'fam-slice',
  rotation: 'fam-rot',
}

/**
 * Familia del movimiento a partir de las capas que afecta (el motor normaliza
 * palitos anchos y cortes a un `Move` con `layers`):
 * · una capa exterior = cara (R, U', D2)
 * · capa exterior + interior = ancha (Rw, r, f')
 * · solo la capa central = corte (M, E, S, M2)
 * · las tres capas del eje = giro de cubo (x, y, z)
 */
export function familyOf(mv: Move): Family {
  const L = [...mv.layers].sort((a, b) => a - b)
  if (L.length === 3) return 'rotation'
  if (L.length === 1 && Math.abs(L[0]) === 1) return 'face'
  if (L.length === 1 && L[0] === 0) return 'slice'
  return 'wide'
}

const AXIS_LABEL: Record<string, string> = { x: 'eje X', y: 'eje Y', z: 'eje Z' }

const AREA_LABEL: Record<string, string> = {
  U: 'capa superior',
  D: 'capa inferior',
  L: 'capa izquierda',
  R: 'capa derecha',
  F: 'capa frontal',
  B: 'capa trasera',
  M: 'corte vertical central',
  E: 'corte horizontal central',
  S: 'corte lateral central',
  x: 'todo el cubo',
  y: 'todo el cubo',
  z: 'todo el cubo',
}

function area(mv: Move): string {
  if (mv.layers.length === 3) return AREA_LABEL[mv.axis] ?? 'todo el cubo'
  // capa exterior por eje + dirección: R/L en x, U/D en y, F/B en z
  const faceByAxis: Record<string, [string, string]> = { x: ['R', 'L'], y: ['U', 'D'], z: ['F', 'B'] }
  const pair = faceByAxis[mv.axis] ?? ['?', '?']
  const layer = mv.layers.slice().sort((a, b) => Math.abs(b) - Math.abs(a))[0]
  const letter = layer === undefined ? '?' : mv.dir === 1 ? pair[0] : pair[1]
  return AREA_LABEL[mv.axis === 'x' ? (layer > 0 ? 'R' : 'L') : mv.axis === 'y' ? (layer > 0 ? 'U' : 'D') : layer > 0 ? 'F' : 'B'] ?? letter
}

export function moveLabel(mv: Move): string {
  return algToString([mv])
}

/** Explicación en español de un giro: zona, eje y sentido. */
export function moveDesc(mv: Move): string {
  const sentido = mv.dir === 1 ? 'horario' : 'antihorario'
  const capas = familyOf(mv) === 'wide' ? ' · dos capas' : familyOf(mv) === 'slice' ? ' · capa central' : ''
  return `${area(mv)} · ${AXIS_LABEL[mv.axis] ?? ''} · ${sentido}${capas}`
}

/** Leyenda de familias presentes en un algoritmo (para la ficha del caso). */
export function notationLegend(alg: string): { label: string; cls: string }[] {
  const out: { label: string; cls: string }[] = []
  try {
    for (const mv of parseAlg(alg)) {
      const fam = familyOf(mv)
      const label = FAMILY_LABEL[fam]
      if (!out.some((x) => x.label === label)) out.push({ label, cls: FAMILY_COLOR[fam] })
    }
  } catch {
    /* algoritmo con tokens desconocidos: sin leyenda */
  }
  return out
}

export interface AlgoStep {
  token: string
  label: string
  family: Family
  state: CubeState
  desc: string
}

function buildSteps(alg: string, start: CubeState): AlgoStep[] {
  const tokens = (alg || '').trim().split(/\s+/).filter(Boolean)
  const out: AlgoStep[] = [{ token: '', label: 'listo', family: 'face', state: cloneState(start), desc: 'estado inicial' }]
  let cur = cloneState(start)
  for (const t of tokens) {
    let mv: Move | undefined
    try {
      mv = parseAlg(t)[0]
    } catch {
      mv = undefined
    }
    if (!mv) {
      out.push({ token: t, label: t, family: 'face', state: cloneState(cur), desc: 'giro no reconocido por el motor' })
      continue
    }
    applyMove(cur, mv)
    out.push({ token: t, label: moveLabel(mv), family: familyOf(mv), state: cloneState(cur), desc: moveDesc(mv) })
  }
  return out
}

export interface AlgoPlayerProps {
  alg: string
  startState?: CubeState
  mirrored?: boolean
  showCube?: boolean
  loops?: number
  autoPlay?: boolean
  onLoopDone?: () => void
  /** Ficha principal del caso: tokens grandes y cubo más grande. */
  primary?: boolean
  /** Muestra la explicación de cada giro aunque el algoritmo sea corto. */
  explain?: boolean
}

/**
 * Reproductor de un algoritmo: paspás, cubo en cada paso, explicación del giro,
 * bucles para ensayar el fingertrick y versión espejada.
 */
export function AlgoPlayer({
  alg,
  startState,
  mirrored = false,
  showCube = true,
  loops = 1,
  autoPlay = false,
  onLoopDone,
  primary = false,
  explain = false,
}: AlgoPlayerProps) {
  const start = useMemo(() => (startState ? cloneState(startState) : solvedState()), [startState])
  const text = mirrored ? mirrorAlg(alg) : alg
  const steps = useMemo(() => buildSteps(text, start), [text, start])
  const n = steps.length - 1
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(0)
  const [loopTarget] = useState(loops)
  const timer = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const advance = useCallback(
    (delta: number) => {
      setI((prev) => {
        const next = prev + delta
        if (next < 0) return 0
        if (next <= n) return next
        if (loop + 1 < loopTarget) {
          setLoop(loop + 1)
          return 0
        }
        setPlaying(false)
        onLoopDone?.()
        return n
      })
    },
    [n, loop, loopTarget, onLoopDone],
  )

  useEffect(() => {
    setI(0)
    setLoop(0)
    setPlaying(autoPlay)
  }, [text, start, autoPlay])

  useEffect(() => {
    if (!playing) {
      clear()
      return
    }
    const mv = steps[i + 1]
    const ms = Math.max(90, Math.round((mv?.family === 'rotation' ? 900 : 620) / speed))
    timer.current = window.setTimeout(() => advance(1), ms)
    return clear
  }, [playing, i, speed, steps, advance, clear])

  useEffect(() => {
    if (!autoPlay) return
    const id = window.setTimeout(() => setPlaying(true), 400)
    return () => window.clearTimeout(id)
  }, [autoPlay, text])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setPlaying(false)
        advance(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setPlaying(false)
        advance(-1)
      } else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.key === 'r' || e.key === 'R') {
        setPlaying(false)
        setI(0)
        setLoop(0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  const cur = steps[Math.min(i, n)]
  const inverse = useMemo(() => {
    try {
      return algToString(invertMoves(parseAlg(text)))
    } catch {
      return ''
    }
  }, [text])

  return (
    <div className={primary ? "player player-primary" : "player"}>
      {showCube && (
        <div className="player-cube">
          <Cube3D state={cur.state} size={primary ? 250 : 220} mirrored={mirrored} />
          {mirrored && <span className="chip on">vista espejada</span>}
        </div>
      )}
      <div className="player-side">
        <div className="player-seq" role="list" aria-label="Algoritmo paso a paso">
          {steps.map((s, idx) => (
            <button
              key={`${s.token}-${idx}`}
              role="listitem"
              className={`tok tok-${s.family}${idx === i ? ' on' : ''}${idx === 0 ? ' start' : ''}`}
              onClick={() => {
                setPlaying(false)
                setI(idx)
              }}
              title={s.desc}
            >
              {s.token ? s.label : 'inicio'}
            </button>
          ))}
        </div>
        <p className={explain ? "player-desc explain" : "player-desc"}>
          {cur.token && i > 0
            ? `${cur.label}: ${cur.desc}`
            : i === 0
              ? 'Pulsa reproducir, o avanza paso a paso con las flechas.'
              : cur.desc}
        </p>
        <div className="row player-controls">
          <button className="btn primary" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar' : 'Reproducir'}>
            {playing ? <PauseIcon /> : <PlayIcon />}
            {playing ? 'pausa' : 'reproducir'}
          </button>
          <button
            className="btn icon-btn"
            onClick={() => {
              setPlaying(false)
              advance(-1)
            }}
            aria-label="Paso anterior"
          >
            <Chevron dir="left" />
          </button>
          <button
            className="btn icon-btn"
            onClick={() => {
              setPlaying(false)
              advance(1)
            }}
            aria-label="Paso siguiente"
          >
            <Chevron dir="right" />
          </button>
          <button
            className="btn"
            onClick={() => {
              setPlaying(false)
              setI(0)
              setLoop(0)
            }}
            aria-label="Reiniciar"
          >
            reinicio
          </button>
          <label className="row">
            velocidad
            <input type="range" min={0.4} max={4} step={0.2} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            <span className="muted">{speed.toFixed(1)}×</span>
          </label>
        </div>
        <p className="hint">
          paso {Math.min(i, n)} de {n}
          {loopTarget > 1 ? ` · vuelta ${Math.min(loop + 1, loopTarget)} de ${loopTarget}` : ''} · flechas para avance
          fino, espacio para reproducir, R para reiniciar
        </p>
        {loops > 1 && (
          <p className="hint">
            El reproductor da {loops} vueltas seguidas: así se ensaya el fingertrick hasta que sale solo, sin leer la
            fórmula.
          </p>
        )}
        {inverse && (
          <p className="hint">
            Inverso (para deshacer y volver al plantado): <span className="mono">{inverse}</span>
          </p>
        )}
      </div>
    </div>
  )
}

/** Algoritmo como texto con fichas por familia de giro. */
export function AlgText({ alg, mirrored = false }: { alg: string; mirrored?: boolean }) {
  const text = mirrored ? mirrorAlg(alg) : alg
  const items = useMemo(() => {
    try {
      return parseAlg(text).map((mv) => ({ label: moveLabel(mv), family: familyOf(mv), desc: moveDesc(mv) }))
    } catch {
      return text
        .split(/\s+/)
        .filter(Boolean)
        .map((t) => ({ label: t, family: 'face' as Family, desc: '' }))
    }
  }, [text])
  return (
    <div className="mono alg-text">
      {items.map((x, i) => (
        <span key={`${x.label}-${i}`} className={`tok tok-${x.family}`} title={x.desc}>
          {x.label}
        </span>
      ))}
    </div>
  )
}
