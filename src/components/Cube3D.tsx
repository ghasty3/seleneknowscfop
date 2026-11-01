/**
 * Cubo 3D real: cámara de perspectiva con algoritmo del pintor.
 * Cada cubie dibuja sus caras visibles; las caras exteriores llevan pegatina
 * con sombreado según su normal, las interiores salen como cuerpo oscuro, de modo
 * que el cubo se lee como una masa compacta y no como piezas sueltas.
 *
 * La cámara es interactiva: se órbita arrastrando (la pegatina/capa sigue el dedo en el cubo
 * manipulable, el fondo gira la vista), se acerca con rueda o pellizco, tiene vistas de
 * preset (de arriba, de frente, la de tres cuartos de siempre) y se mueve con el teclado
 * cuando el visor está enfocado. El estado de la cámara vive fuera del componente cuando el
 * padre la controla (`cam` + `onCamChange`), porque el arrastre de capas de `InteractiveCube`
 * necesita proyectar con la MISMA cámara con la que se está dibujando.
 */

const UNIT = 100
/** Encogido de la pegatina respecto de su cara: deja la costura oscura. */
const SEAM = 0.93
const FOCAL = 5.6
/** Ángulos con los que el cubo se dibuja por defecto (tres cuartos, visto desde arriba). */
const YAW0 = (36 * Math.PI) / 180
const PITCH0 = (27 * Math.PI) / 180
const DIST0 = 10.5
/** Luz de la mesa: desde arriba, algo hacia F y R. */
const LIGHT: [number, number, number] = [0.42, 0.86, 0.58]

import { useCallback, useEffect, useRef, useState } from 'react'
import { FACE_HEX, FACE_HEX_DIM, CORE_HEX } from '../cube/palette'

/**
 * El color del cubo NO se decide aquí: viene de `src/cube/palette.ts`, que es la fuente de
 * verdad del esquema oficial (amarillo arriba · blanco abajo · verde delante · azul detrás ·
 * naranja a la derecha · rojo a la izquierda). Antes esta hoja traía una paleta propia más
 * apagada y con el rojo y el naranja cambiados de lado, y por eso el cubo 3D no se parecía al
 * cubo real de la mesa.
 */
const COLORS = FACE_HEX
const COLORS_DIM = FACE_HEX_DIM
const BODY = CORE_HEX

export type V3 = [number, number, number]
/** Ángulos y distancia de la cámara. `pitch` positivo = mirando desde arriba. */
export type Cam = { yaw: number; pitch: number; dist: number }
export const DEFAULT_CAM: Cam = { yaw: YAW0, pitch: PITCH0, dist: DIST0 }

/** Sensibilidad del arrastre (rad por px): ~0,8°/px, ni muy rápido ni muy lento. */
export const DRAG_K = 0.014
/** Se deja medio grado para abajo del cenit para que el eje no se pliegue. */
export const PITCH_MAX = (88 * Math.PI) / 180
export const DIST_MIN = 9
export const DIST_MAX = 15
/** Caja de recorte fija, en unidades de proyección: 7 de distrito la llena casi entera. */
export const VBOX = 300
const ZOOM_K = 0.004
const CAM_KEY = 'cubo3d.cam'

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const deg = (r: number) => `${((r * 180) / Math.PI).toFixed(0)}°`

/** Guarda la vista solo si el visor tiene permiso de recordar (los cubos decorativos no). */
function saveCam(persist: boolean, cam?: Cam) {
  if (!persist) return
  try {
    localStorage.setItem(CAM_KEY, JSON.stringify(cam ?? initialCam()))
  } catch {
    /* sin localStorage: la vista simplemente no se recuerda */
  }
}

function reducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** El ángulo se queda siempre en (-π, π] para que el preset no dé la vuelta larga. */
function normAngle(a: number): number {
  let x = a
  while (x > Math.PI) x -= 2 * Math.PI
  while (x < -Math.PI) x += 2 * Math.PI
  return x
}

function loadCam(): Cam | null {
  try {
    const raw = localStorage.getItem(CAM_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Cam
    if (typeof p?.yaw !== 'number' || typeof p?.pitch !== 'number' || typeof p?.dist !== 'number') return null
    if (!Number.isFinite(p.yaw) || !Number.isFinite(p.pitch)) return null
    return { yaw: p.yaw, pitch: clamp(p.pitch, -PITCH_MAX, PITCH_MAX), dist: clamp(p.dist, DIST_MIN, DIST_MAX) }
  } catch {
    return null
  }
}

/** La vista en la que el usuario dejó el cubo la última vez (o la de tres cuartos). */
export function initialCam(): Cam {
  return loadCam() ?? DEFAULT_CAM
}

/** Cámara con los senos/cosenos y el ojo ya calculados (se reutiliza en todo el render). */
export type Camera = { cy: number; sy: number; cp: number; sp: number; eye: V3; dist: number }

export function makeCamera(cam: Cam): Camera {
  const yaw = cam.yaw
  const pitch = clamp(cam.pitch, -PITCH_MAX, PITCH_MAX)
  const dist = clamp(cam.dist, DIST_MIN, DIST_MAX)
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  // El ojo está a `dist` en +z y se le aplica el pitch y después el yaw.
  const yp: V3 = [0, dist * sp, dist * cp]
  return { cy, sy, cp, sp, dist, eye: [yp[0] * cy - yp[2] * sy, yp[1], yp[0] * sy + yp[2] * cy] }
}

/** Giro de la escena a coordenadas de cámara (yaw sobre Y, pitch sobre X). */
function turnBy(k: Camera, x: number, y: number, z: number): V3 {
  const x1 = x * k.cy + z * k.sy
  const z1 = -x * k.sy + z * k.cy
  const y2 = y * k.cp - z1 * k.sp
  const z2 = y * k.sp + z1 * k.cp
  return [x1, y2, z2]
}

function depthOf(k: Camera, v: V3): number {
  return k.dist - v[2]
}

/** Proyección en px de viewBox con perspectiva. `mirrored` espeja la vista (espejo R↔L). */
function project(k: Camera, v: V3, mirrored: boolean): [number, number] {
  const s = (FOCAL / depthOf(k, v)) * UNIT
  return [mirrored ? -v[0] * s : v[0] * s, -v[1] * s]
}

/** Punto del mundo a pantalla con una cámara dada (lo que usan las flechas del cubo manipulable). */
export function projCam(k: Camera, x: number, y: number, z: number, mirrored = false): [number, number] {
  return project(k, turnBy(k, x, y, z), mirrored)
}

const BASE_CAM = makeCamera(DEFAULT_CAM)

/**
 * Arrastre → cámara. `dx`/`dy` en píxeles de pantalla; el arrastre a la derecha lleva la cara
 * frontal hacia la derecha, y el hacia abajo levanta la elevación (se ve más techo). En el cubo
 * espejado el signo del yaw se invierte: el gesto es el que se ve en pantalla, no el del mundo.
 */
export function orbitCam(cam: Cam, dx: number, dy: number, mirrored = false): Cam {
  const sign = mirrored ? -1 : 1
  return { ...cam, yaw: cam.yaw + dx * DRAG_K * sign, pitch: clamp(cam.pitch + dy * DRAG_K, -PITCH_MAX, PITCH_MAX) }
}

/** Rueda o pellizco → cámara (`delta` positivo = alejar). Acotada: no deja perder el cubo. */
export function zoomCam(cam: Cam, delta: number): Cam {
  return { ...cam, dist: clamp(cam.dist + delta * ZOOM_K, DIST_MIN, DIST_MAX) }
}

/** Teclado → cámara: `dx`/`dy` en pasos de giro (1 = 5°), `dz` en pasos de zoom. */
export function nudgeCam(cam: Cam, dx: number, dy: number, dz: number, mirrored = false): Cam {
  const step = Math.PI / 36
  return {
    yaw: cam.yaw + dx * step * (mirrored ? -1 : 1),
    pitch: clamp(cam.pitch + dy * step, -PITCH_MAX, PITCH_MAX),
    dist: clamp(cam.dist + dz * 0.8, DIST_MIN, DIST_MAX),
  }
}

/** Vista de planta: mirar la cara de arriba (U) de frente. */
export function topView(dist = DIST0): Cam {
  // yaw 0, no el yaw heredado: con 36° la cara de arriba salía en rombo y había que girar la
  // cabeza para leerla. En planta la cuadrícula tiene que salir recta.
  return { yaw: 0, pitch: PITCH_MAX, dist }
}

/** Vista de frente, sin elevación: la cara F mirando a la cámara. */
export function frontView(dist = DIST0): Cam {
  return { yaw: 0, pitch: 0, dist }
}

/** Versión con la cámara de siempre, para quien no controla la vista. */
export function proj(x: number, y: number, z: number, mirrored = false): [number, number] {
  return projCam(BASE_CAM, x, y, z, mirrored)
}

/** Centro de la pegatina (normal × 0.5) en coordenadas del mundo. */
export function stickerNormal(rot: number[], face: string): V3 {
  const ax = AXES.find((a) => a.face === face)
  if (!ax) return [0, 0, 0]
  return [
    rot[0] * ax.n[0] + rot[1] * ax.n[1] + rot[2] * ax.n[2],
    rot[3] * ax.n[0] + rot[4] * ax.n[1] + rot[5] * ax.n[2],
    rot[6] * ax.n[0] + rot[7] * ax.n[1] + rot[8] * ax.n[2],
  ]
}

function dot(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const LIGHT_N: V3 = (() => {
  const m = Math.hypot(...LIGHT)
  return [LIGHT[0] / m, LIGHT[1] / m, LIGHT[2] / m]
})()

/** Color de pegatina con luz de mesa: sin pegatinas planas. */
function shade(hex: string, k: number): string {
  const [r, g, b] = hexToRgb(hex)
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)))
  return `rgb(${c(r)},${c(g)},${c(b)})`
}

/** Mezcla pegatina iluminada → pegatina en sombra (más realista que sombrear una sola base). */
function stickerFill(face: string, lit: number): string {
  const a = hexToRgb(COLORS[face])
  const b = hexToRgb(COLORS_DIM[face])
  const k = Math.max(0, Math.min(1, (lit - 0.66) / 0.34))
  return '#' + a.map((v, i) => Math.round(b[i] + (v - b[i]) * k).toString(16).padStart(2, '0')).join('')
}

const AXES: { n: [number, number, number]; face: string }[] = [
  { n: [1, 0, 0], face: 'R' },
  { n: [-1, 0, 0], face: 'L' },
  { n: [0, 1, 0], face: 'U' },
  { n: [0, -1, 0], face: 'D' },
  { n: [0, 0, 1], face: 'F' },
  { n: [0, 0, -1], face: 'B' },
]

const PERP: Record<string, [[number, number, number], [number, number, number]]> = {
  R: [[0, 1, 0], [0, 0, 1]],
  L: [[0, 1, 0], [0, 0, 1]],
  U: [[1, 0, 0], [0, 0, 1]],
  D: [[1, 0, 0], [0, 0, 1]],
  F: [[1, 0, 0], [0, 1, 0]],
  B: [[1, 0, 0], [0, 1, 0]],
}

interface Poly {
  pts: string
  fill: string
  stroke: string
  depth: number
  key: string
  index: number
  face: string
  pos: V3
  sticker: boolean
}

function facesOf(cubie: { pos: V3; rot: number[] }, k: Camera, mirrored: boolean, index: number): Poly[] {
  const out: Poly[] = []
  const c = cubie.pos
  for (const ax of AXES) {
    const w = stickerNormal(cubie.rot, ax.face)
    // ¿mira hacia la cámara?
    const eye: V3 = [k.eye[0] - (c[0] + w[0] * 0.5), k.eye[1] - (c[1] + w[1] * 0.5), k.eye[2] - (c[2] + w[2] * 0.5)]
    if (dot(w, eye) <= 0) continue
    const [a, b] = PERP[ax.face]
    const wa: V3 = [
      cubie.rot[0] * a[0] + cubie.rot[1] * a[1] + cubie.rot[2] * a[2],
      cubie.rot[3] * a[0] + cubie.rot[4] * a[1] + cubie.rot[5] * a[2],
      cubie.rot[6] * a[0] + cubie.rot[7] * a[1] + cubie.rot[8] * a[2],
    ]
    const wb: V3 = [
      cubie.rot[0] * b[0] + cubie.rot[1] * b[1] + cubie.rot[2] * b[2],
      cubie.rot[3] * b[0] + cubie.rot[4] * b[1] + cubie.rot[5] * b[2],
      cubie.rot[6] * b[0] + cubie.rot[7] * b[1] + cubie.rot[8] * b[2],
    ]
    const cx = c[0] + w[0] * 0.5
    const cy = c[1] + w[1] * 0.5
    const cz = c[2] + w[2] * 0.5
    const center: V3 = [cx, cy, cz]
    const isSticker = dot(w, c) > 0
    const inset = isSticker ? SEAM : 1
    const pts: string[] = []
    let zsum = 0
    for (const [sa, sb] of [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ]) {
      const p: V3 = [cx + (wa[0] * sa + wb[0] * sb) * 0.5, cy + (wa[1] * sa + wb[1] * sb) * 0.5, cz + (wa[2] * sa + wb[2] * sb) * 0.5]
      const q: V3 = [center[0] + (p[0] - center[0]) * inset, center[1] + (p[1] - center[1]) * inset, center[2] + (p[2] - center[2]) * inset]
      const tq = turnBy(k, q[0], q[1], q[2])
      zsum += tq[2]
      const [X, Y] = project(k, tq, mirrored)
      pts.push(`${X.toFixed(1)},${Y.toFixed(1)}`)
    }
    const lit = 0.66 + 0.34 * Math.max(0, dot(w, LIGHT_N))
    out.push({
      pts: pts.join(' '),
      fill: isSticker ? stickerFill(ax.face, lit) : shade(BODY, 0.8 + 0.3 * Math.max(0, dot(w, LIGHT_N))),
      stroke: isSticker ? 'rgba(8,5,14,0.55)' : 'rgba(8,5,14,0.85)',
      depth: zsum / 4 + (isSticker ? 0.0015 : 0),
      key: `${index}:${ax.face}`,
      index,
      face: ax.face,
      pos: c,
      sticker: isSticker,
    })
  }
  return out
}

export interface Cube3DProps {
  state: { cubies: { pos: [number, number, number]; rot: number[] }[]; move?: string }
  size?: number
  mirrored?: boolean
  onFaceClick?: (face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B') => void
  /** Pulsación sobre una pegatina concreta (para el cubo manipulable). */
  onStickerDown?: (info: { index: number; face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B'; pos: [number, number, number]; x: number; y: number }) => void
  highlight?: [number, number, number][]
  ghost?: [number, number, number]
  /** Cámara controlada desde fuera; si no viene, el visor la gestiona él solo. */
  cam?: Cam
  onCamChange?: (next: Cam) => void
  /** Permite órbita por arrastre/teclado. Verdadero por defecto. */
  orbit?: boolean
  /** Muestra la fila de vistas (de arriba, de frente, reset, zoom). Por defecto: la del cubo manipulable. */
  controls?: boolean
  /** Recalculado con la cámara viva: lo usan las flechas del arrastre de capas. */
  persistCam?: boolean
}

const EASE = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t)

export function Cube3D({
  state,
  size = 260,
  mirrored = false,
  onFaceClick,
  onStickerDown,
  highlight = [],
  ghost,
  cam: camProp,
  onCamChange,
  orbit = true,
  controls,
  persistCam = true,
}: Cube3DProps) {
  const [ownCam, setOwnCam] = useState<Cam>(() => (persistCam ? loadCam() ?? DEFAULT_CAM : DEFAULT_CAM))
  const cam = camProp ?? ownCam
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const raf = useRef<number | null>(null)
  /** Arrastre en curso: ángulos de salida, último punto y última muestra (para la inercia). */
  const drag = useRef<{ yaw: number; pitch: number; x: number; y: number; baseCam: Cam; t: number; vx: number; vy: number } | null>(null)
  const camRef = useRef(cam)
  camRef.current = cam

  const applyCam = useCallback(
    (next: Cam, save = false) => {
      const clamped: Cam = { yaw: next.yaw, pitch: clamp(next.pitch, -PITCH_MAX, PITCH_MAX), dist: clamp(next.dist, DIST_MIN, DIST_MAX) }
      camRef.current = clamped
      if (onCamChange) onCamChange(clamped)
      else setOwnCam(clamped)
      if (save && persistCam) {
        try {
          localStorage.setItem(CAM_KEY, JSON.stringify(clamped))
        } catch {
          /* sin localStorage: la vista simplemente no se recuerda */
        }
      }
    },
    [onCamChange, persistCam],
  )

  /** Parada de animaciones propias (transición de preset o inercia). */
  const stopMotion = useCallback(() => {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [])

  /** Lleva la cámara al destino en ~240 ms; con `prefers-reduced-motion` salta directo. */
  const animateTo = useCallback(
    (to: Cam) => {
      const from = camRef.current
      const target: Cam = { yaw: from.yaw + normAngle(to.yaw - from.yaw), pitch: to.pitch, dist: to.dist }
      if (reducedMotion()) {
        applyCam(target, true)
        return
      }
      stopMotion()
      const t0 = performance.now()
      const step = (now: number) => {
        const p = clamp((now - t0) / 240, 0, 1)
        const k = EASE(p)
        if (p < 1) {
          applyCam({ yaw: from.yaw + (target.yaw - from.yaw) * k, pitch: from.pitch + (target.pitch - from.pitch) * k, dist: from.dist + (target.dist - from.dist) * k }, false)
          raf.current = requestAnimationFrame(step)
          return
        }
        raf.current = null
        applyCam(target, true)
      }
      raf.current = requestAnimationFrame(step)
    },
    [applyCam, stopMotion],
  )

  useEffect(() => stopMotion, [stopMotion])

  // En pantallas táctiles el cubo se queda el gesto (órbita y arrastre de capa); en escritorio se
  // deja `pan-y` para que la rueda y el scroll de la página sigan siendo de la página.
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
    el.classList.toggle('touch', coarse)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (!orbit) return
    if (e.button !== undefined && e.button !== 0) return
    stopMotion()
    const c = camRef.current
    drag.current = { yaw: c.yaw, pitch: c.pitch, x: e.clientX, y: e.clientY, baseCam: c, t: performance.now(), vx: 0, vy: 0 }
    setDragging(true)
    svgRef.current?.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    // El arrastre se mide desde el punto donde se empezó, con los ángulos de salida.
    const next = orbitCam(d.baseCam, e.clientX - d.x, e.clientY - d.y, mirrored)
    const now = performance.now()
    const dt = Math.max(8, now - d.t)
    d.vx = ((next.yaw - d.yaw) / dt) * 16
    d.vy = ((next.pitch - d.pitch) / dt) * 16
    d.yaw = next.yaw
    d.pitch = next.pitch
    d.t = now
    applyCam(next)
  }

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    setDragging(false)
    svgRef.current?.releasePointerCapture?.(e.pointerId)
    saveCam(persistCam, camRef.current)
    // Inercia corta: el cubo termina de girar lo que llevaba de impulso.
    const speed = Math.hypot(d.vx, d.vy)
    if (reducedMotion() || speed < 0.004) return
    stopMotion()
    let vx = d.vx
    let vy = d.vy
    let yaw = camRef.current.yaw
    let pitch = camRef.current.pitch
    const step = () => {
      vx *= 0.9
      vy *= 0.9
      yaw += vx
      pitch = clamp(pitch + vy, -PITCH_MAX, PITCH_MAX)
      applyCam({ ...camRef.current, yaw, pitch })
      raf.current = Math.hypot(vx, vy) > 0.0006 ? requestAnimationFrame(step) : null
      if (raf.current === null) saveCam(persistCam, camRef.current)
    }
    raf.current = requestAnimationFrame(step)
  }

  /** Rueda sobre el visor: acerca. Con la página ya en su sitio se deja pasar el scroll. */
  const onWheel = (e: React.WheelEvent) => {
    if (!orbit) return
    const next = zoomCam(camRef.current, e.deltaY)
    // Si ya estaba en su límite, la rueda es de la página: no se la secuestra al scroll.
    if (Math.abs(next.dist - camRef.current.dist) < 1e-6) return
    applyCam(next, true)
  }

  const onDoubleClick = () => animateTo(DEFAULT_CAM)

  const onKey = (e: React.KeyboardEvent) => {
    if (!orbit) return
    const c = camRef.current
    const step = e.shiftKey ? 4 : 1
    const k = e.key
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault()
      const dx = k === 'ArrowLeft' ? -step : k === 'ArrowRight' ? step : 0
      const dy = k === 'ArrowUp' ? -step : k === 'ArrowDown' ? step : 0
      animateTo(nudgeCam(c, dx, dy, 0, mirrored))
    } else if (k === '+' || k === '=') {
      e.preventDefault()
      animateTo(nudgeCam(c, 0, 0, -1))
    } else if (k === '-' || k === '_') {
      e.preventDefault()
      animateTo(nudgeCam(c, 0, 0, 1))
    } else if (k === '0' || k === 'Enter') {
      e.preventDefault()
      animateTo(DEFAULT_CAM)
    }
  }

  const k = makeCamera(cam)
  const polys: Poly[] = []
  state.cubies.forEach((c, i) => polys.push(...facesOf(c as { pos: V3; rot: number[] }, k, mirrored, i)))
  polys.sort((a, b) => a.depth - b.depth)

  // Caja de recorte FIJA, en unidades de proyección: la cámara mira al centro del cubo y la
  // proyección del origen sale exactamente (0,0), así que el cubo queda centrado por construcción.
  // Si la caja se ajustase a lo que entra (como hacía esta hoja antes), acercar casi no se notaría
  // y el cubo cambiaría de tamaño en cada giro: eso es justo lo que pone la vista nerviosa.
  const box = VBOX

  const hl = new Set(highlight.map((p) => p.join(',')))
  const ghostKey = ghost ? ghost.join(',') : ''
  const interactive = Boolean(onStickerDown)
  const showControls = controls ?? interactive
  const cls = `cube3d${interactive ? ' interactive' : ''}${orbit ? ' orbitable' : ''}${dragging ? ' dragging' : ''}`
  const label = orbit
    ? `Cubo en tres dimensiones. Vista a ${deg(cam.yaw)} de giro y ${deg(cam.pitch)} de elevación; arrastra para girar la vista, rueda para acercar, 0 para volver.`
    : 'Cubo en tres dimensiones'

  return (
    <div className="cube3d-wrap">
      <svg
        ref={svgRef}
        className={cls}
        width={size}
        height={size}
        viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}
        role={orbit ? 'group' : 'img'}
        aria-label={label}
        tabIndex={orbit ? 0 : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKey}
      >
        {/* Toda la caja es superficie de arrastre: no hay que acertar al cubo para girar la vista. */}
        <rect className="cube3d-hit" x={-box / 2} y={-box / 2} width={box} height={box} fill="transparent" />
        {polys.map((p) => {
          const isHl = hl.has(p.pos.join(','))
          const isGhost = p.pos.join(',') === ghostKey
          if (!p.sticker) {
            return <polygon key={p.key} className="bodyface" points={p.pts} fill={p.fill} stroke={p.stroke} strokeWidth={1.1} />
          }
          return (
            <polygon
              key={p.key}
              className={`sticker face-${p.face}${isHl ? ' hl' : ''}${isGhost ? ' ghost' : ''}`}
              points={p.pts}
              fill={p.fill}
              stroke={p.stroke}
              strokeWidth={1.1}
              onPointerDown={(e) => {
                if (onStickerDown) {
                  // La pegatina es para girar la capa: no deja pasar el gesto al fondo.
                  e.stopPropagation()
                  onStickerDown({ index: p.index, face: p.face as 'U' | 'D' | 'L' | 'R' | 'F' | 'B', pos: p.pos, x: e.clientX, y: e.clientY })
                } else if (onFaceClick) onFaceClick(p.face as 'U' | 'D' | 'L' | 'R' | 'F' | 'B')
              }}
              data-pos={p.pos.join(',')}
            />
          )
        })}
      </svg>
      {showControls && (
        <div className="cube3d-controls row" role="group" aria-label="Vistas del cubo">
          <button
            className="btn"
            onClick={() => animateTo(topView(cam.dist))}
            title="Mirar la cara de arriba (U) en planta"
          >
            de arriba
          </button>
          <button className="btn" onClick={() => animateTo(frontView(cam.dist))} title="Mirar de frente, sin elevación">
            de frente
          </button>
          <button className="btn" onClick={() => animateTo(DEFAULT_CAM)} title="Volver a la vista de tres cuartos">
            reset
          </button>
          <button className="btn" onClick={() => animateTo(zoomCam(cam, -350))} aria-label="Acercar el cubo">
            +
          </button>
          <button className="btn" onClick={() => animateTo(zoomCam(cam, 350))} aria-label="Alejar el cubo">
            −
          </button>
        </div>
      )}
    </div>
  )
}
