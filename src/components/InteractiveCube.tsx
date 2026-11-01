import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Cube3D, initialCam, makeCamera, projCam, stickerNormal, type Cam } from './Cube3D'
import {
  algToString,
  applyMove,
  cloneState,
  invertMoves,
  isSolved,
  parseAlg,
  solvedState,
  scramble as makeScramble,
  type Axis,
  type CubeState,
  type Face,
  type Move,
} from '../cube/engine'

const FACE_AXIS: Record<Face, { axis: Axis; layer: number }> = {
  R: { axis: 'x', layer: 1 },
  L: { axis: 'x', layer: -1 },
  U: { axis: 'y', layer: 1 },
  D: { axis: 'y', layer: -1 },
  F: { axis: 'z', layer: 1 },
  B: { axis: 'z', layer: -1 },
}

/** Sentido horario visto desde esa cara = -90° sobre su eje (convención del motor). */
const CW: 1 | -1 = -1
const CCW: 1 | -1 = 1

const IN_PLANE: Record<Face, Axis[]> = {
  R: ['y', 'z'],
  L: ['y', 'z'],
  U: ['x', 'z'],
  D: ['x', 'z'],
  F: ['x', 'y'],
  B: ['x', 'y'],
}

const coord = (axis: Axis, pos: [number, number, number]) => (axis === 'x' ? pos[0] : axis === 'y' ? pos[1] : pos[2])

function faceMove(face: Face, dir: 1 | -1, times = 1): Move[] {
  const { axis, layer } = FACE_AXIS[face]
  const out: Move[] = []
  for (let i = 0; i < times; i++) out.push({ id: dir === CW ? face : `${face}’`, axis, layers: [layer], dir })
  return out
}

function stickerCenter(pos: [number, number, number], rot: number[], face: Face): [number, number, number] {
  const n = stickerNormal(rot, face)
  return [pos[0] + n[0] * 0.5, pos[1] + n[1] * 0.5, pos[2] + n[2] * 0.5]
}

export interface InteractiveCubeProps {
  size?: number
  startState?: CubeState
  /** Algoritmo que se quiere entrenar: se mide cuánto de él va ejecutado. */
  target?: string
  /** Plantado del caso (stateFromAlg/alg⁻¹): se ofrece el botón de plantar. */
  mirrored?: boolean
  highlight?: [number, number, number][]
  autoScramble?: boolean
  pad?: boolean
  onSolved?: (info: { ms: number; moves: number }) => void
  onMove?: (label: string) => void
}

/**
 * Cubo manipulable: se gira arrastrando sobre una pegatina (la capa sigue el dedo),
 * un toque gira esa cara, y el fondo rota la vista. Detecta el resolvido, cuenta giros,
 * cronometra y mide el progreso contra el algoritmo que se esté entrenando.
 */
export function InteractiveCube({
  size = 300,
  startState,
  target,
  mirrored = false,
  highlight,
  autoScramble = false,
  pad = true,
  onSolved,
  onMove,
}: InteractiveCubeProps) {
  const [st, setSt] = useState<CubeState>(() => (startState ? cloneState(startState) : solvedState()))
  const [moves, setMoves] = useState<string[]>([])
  const [scramble, setScramble] = useState('')
  const [t0, setT0] = useState<number | null>(null)
  const [done, setDone] = useState<{ ms: number; moves: number } | null>(null)
  const [lastMove, setLastMove] = useState<string>('')
  const [view, setView] = useState({ x: 0, y: 0, z: 0 }) // rotaciones de vista acumuladas
  /**
   * La cámara vive aquí, no dentro del visor: el arrastre de capas necesita proyectar con la
   * MISMA cámara con la que se está dibujando, y si el ángulo viviera en `Cube3D` la proyección
   * del gesto se calculría con un punto de vista distinto (la capa giraría hacia otro lado).
   */
  const [cam, setCam] = useState<Cam>(() => initialCam())
  const camRef = useRef(cam)
  camRef.current = cam
  const history = useRef<Move[][]>([])
  const drag = useRef<{ index: number; face: Face; pos: [number, number, number]; x: number; y: number; applied: boolean } | null>(null)
  const stRef = useRef(st)
  stRef.current = st

  const targetMoves = useMemo(() => {
    if (!target) return []
    try {
      return parseAlg(target)
    } catch {
      return []
    }
  }, [target])

  const push = useCallback(
    (mvs: Move[], log: string[]) => {
      if (!mvs.length) return
      setSt((prev) => {
        const next = cloneState(prev)
        for (const m of mvs) applyMove(next, m)
        return next
      })
      setMoves((prev) => [...prev, ...log])
      setLastMove(log.join(' '))
      setT0((prev) => prev ?? Date.now())
      setDone(null)
      history.current.push(mvs)
      for (const l of log) onMove?.(l)
    },
    [onMove],
  )

  const doFace = useCallback(
    (face: Face, dir: 1 | -1, times = 1) => {
      const mvs = faceMove(face, dir, times)
      push(mvs, mvs.map((m) => m.id))
    },
    [push],
  )

  const undo = useCallback(() => {
    const group = history.current.pop()
    if (!group) return
    const inv = invertMoves(group)
    setSt((p) => {
      const next = cloneState(p)
      for (const m of inv) applyMove(next, m)
      return next
    })
    setMoves((prev) => prev.slice(0, -group.length))
    setLastMove('deshecho: ' + group.map((m) => m.id).join(' '))
  }, [])

  const reset = useCallback(
    (opts: { scramble?: string; plant?: CubeState } = {}) => {
      const base = opts.plant ?? solvedState()
      const next = cloneState(base)
      const scr = opts.scramble ?? ''
      const log: string[] = []
      if (scr) {
        try {
          for (const m of parseAlg(scr)) {
            applyMove(next, m)
            log.push(m.id)
          }
        } catch {
          /* plantado inválido */
        }
      }
      setSt(next)
      setMoves([])
      history.current = []
      setScramble(scr)
      setT0(scr ? Date.now() : null)
      setDone(null)
      setLastMove('')
      setView({ x: 0, y: 0, z: 0 })
    },
    [],
  )

  const newScramble = useCallback(() => {
    reset({ scramble: makeScramble() })
  }, [reset])

  useEffect(() => {
    if (autoScramble) newScramble()
  }, [autoScramble, newScramble])

  // arrastre sobre pegatina: la capa sigue el dedo
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current
      if (!d || d.applied) return
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      if (Math.hypot(dx, dy) < 16) return
      d.applied = true
      const state = stRef.current
      const cubie = state.cubies[d.index]
      if (!cubie) return
      const from = stickerCenter(cubie.pos, cubie.rot, d.face)
      // Se proyecta con la cámara viva: el gesto tiene que seguir el dedo desde cualquier vista.
      const shoot = (p: [number, number, number]) => projCam(makeCamera(camRef.current), p[0], p[1], p[2], mirrored)
      let best: { mv: Move; score: number; id: string } | null = null
      for (const axis of IN_PLANE[d.face]) {
        for (const dir of [CW, CCW] as const) {
          const cand = cloneState(state)
          const mv: Move = { id: 'arrastre', axis, layers: [coord(axis, d.pos)], dir }
          applyMove(cand, mv)
          const c2 = cand.cubies[d.index]
          const to = stickerCenter(c2.pos, c2.rot, d.face)
          const [ax, ay] = shoot(from)
          const [bx, by] = shoot(to)
          const len = Math.hypot(bx - ax, by - ay) || 1
          const score = ((bx - ax) * dx + (by - ay) * dy) / (len * Math.hypot(dx, dy))
          if (!best || score > best.score) best = { mv, score, id: mv.id }
        }
      }
      if (best && best.score > 0.25) {
        const label = labelOf(best.mv.axis, coord(best.mv.axis, d.pos), best.mv.dir)
        push([{ ...best.mv, id: label }], [label])
      }
    }
    const up = () => {
      const d = drag.current
      drag.current = null
      if (!d || d.applied) return
      // toque simple: gira la cara pulsada en sentido horario
      doFace(d.face, CW)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [doFace, push, mirrored])

  // teclado: U D L R F B (con Mayúsculas = antihorario), Backspace = deshacer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      const k = e.key
      const face = 'RrLlFfBbUuDd'.includes(k) ? (k.toUpperCase() as Face) : null
      if (face) {
        e.preventDefault()
        doFace(face, e.shiftKey ? CCW : CW)
        return
      }
      const axis = (['x', 'y', 'z'] as Axis[]).find((a) => a === k.toLowerCase())
      if (axis) {
        // rotación de cubo completo: solo cambia la vista, no el estado relativo
        const dir = k === k.toUpperCase() ? CCW : CW
        e.preventDefault()
        push([{ id: `v${k}`, axis, layers: [-1, 0, 1], dir }], [])
        setView((v) => ({ ...v, [axis]: (v[axis] + (dir === CW ? 1 : -1) + 4) % 4 }))
        setT0((prev) => prev)
        return
      }
      if (k === 'Backspace') {
        e.preventDefault()
        undo()
      } else if (k === 'Escape') {
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doFace, undo, reset])

  // resolvido: se comprueba ignorando las rotaciones de vista
  const solved = useMemo(() => {
    const c = cloneState(st)
    for (const axis of ['x', 'y', 'z'] as Axis[]) {
      const n = view[axis]
      for (let i = 0; i < Math.abs(n); i++) {
        applyMove(c, { id: 'vista', axis, layers: [-1, 0, 1], dir: n > 0 ? CCW : CW })
      }
    }
    return isSolved(c)
  }, [st, view])

  useEffect(() => {
    if (!solved || t0 === null || done) return
    const ms = Date.now() - t0
    setDone({ ms, moves: moves.length })
    onSolved?.({ ms, moves: moves.length })
  }, [solved, t0, done, moves.length, onSolved])

  // progreso contra el algoritmo objetivo
  const progress = useMemo(() => {
    if (!targetMoves.length) return null
    let i = 0
    while (i < moves.length && i < targetMoves.length && moves[i] === targetMoves[i].id) i++
    const matched = Math.min(i, targetMoves.length)
    return { matched, total: targetMoves.length, exact: i >= targetMoves.length, diverged: i < moves.length }
  }, [moves, targetMoves])

  return (
    <div className="icube">
      <div className="icube-stage">
        <div className="icube-cube">
          <Cube3D
            state={st}
            size={size}
            mirrored={mirrored}
            highlight={highlight}
            cam={cam}
            onCamChange={setCam}
            controls
            onStickerDown={(info) => {
              drag.current = { index: info.index, face: info.face, pos: info.pos, x: info.x, y: info.y, applied: false }
            }}
          />
        </div>
        <div className="icube-hud">
          <p className="icube-scramble mono">
            <span className="muted">planted</span> {scramble || '—'}
          </p>
          <div className="icube-stats row">
            <span className="chip">{moves.length} giros</span>
            {t0 !== null && !done && <span className="chip on">{((Date.now() - t0) / 1000).toFixed(1)} s</span>}
            {solved && <span className="chip ok">resuelto</span>}
            {lastMove && (
              <span className="chip mono" key={lastMove}>
                {lastMove}
              </span>
            )}
          </div>
          {progress && (
            <div className="match">
              <div className="match-bar" role="progressbar" aria-valuenow={progress.matched} aria-valuemax={progress.total}>
                <span style={{ width: `${(progress.matched / progress.total) * 100}%` }} />
              </div>
              <p className="match-note">
                {progress.exact
                  ? 'así es, el algoritmo completo'
                  : progress.diverged
                    ? `se desvía en el giro ${progress.matched + 1}`
                    : `${progress.matched} de ${progress.total} giros`}
              </p>
            </div>
          )}
          {done && (
            <p className="icube-done">
              resolvido en {(done.ms / 1000).toFixed(2)} s con {done.moves} giros
            </p>
          )}
          <div className="icube-actions row">
            <button className="btn" onClick={newScramble}>
              remover
            </button>
            <button className="btn" onClick={() => reset()} disabled={moves.length === 0} title="Volver al plantado">
              plantar
            </button>
            <button className="btn" onClick={undo} disabled={moves.length === 0}>
              deshacer
            </button>
          </div>
        </div>
      </div>
      {pad && (
        <div className="icube-pad" aria-label="Panel de giros">
          {(['U', 'D', 'L', 'R', 'F', 'B'] as Face[]).map((f) => (
            <span className="pad-face" key={f}>
              <button className="btn pad-btn" onClick={() => doFace(f, CW)} title={`${f} horario`}>
                {f}
              </button>
              <button className="btn pad-btn" onClick={() => doFace(f, CCW)} title={`${f}' antihorario`}>
                {f}&#8242;
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="hint icube-hint">
        Arrastra una pegatina para girar su capa, tócala para girar la cara entera, y arrastra el cubo por fuera de
        las pegatinas (o el fondo) para girar la vista: rueda para acercar, doble clic o toque para volver. Vista en
        memoria. Teclado: R U F B L D (con Mayúsculas = al revés), flechas mueven la vista, + - acercan, 0 vuelve,
        Backspace deshace, Esc reinicia.
      </p>
    </div>
  )
}

/** Notación legible de un giro de capa: cara más cercana al eje + sentido. */
export function labelOf(axis: Axis, layer: number, dir: 1 | -1): string {
  const pair: Record<Axis, string> = { x: layer > 0 ? 'R' : 'L', y: layer > 0 ? 'U' : 'D', z: layer > 0 ? 'F' : 'B' }
  return dir === CW ? pair[axis] : `${pair[axis]}’`
}

export { faceMove as faceMoves }
