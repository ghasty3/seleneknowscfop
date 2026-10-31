/**
 * Cubo 3D real: cámara de perspectiva con algoritmo del pintor.
 * Cada cubie dibuja sus caras visibles; las caras exteriores llevan pegatina
 * con sombreado según su normal, las interiores salen como cuerpo oscuro, de modo
 * que el cubo se lee como una masa compacta y no como piezas sueltas.
 */

const UNIT = 100
/** Encogido de la pegatina respecto de su cara: deja la costura oscura. */
const SEAM = 0.93
const YAW = (36 * Math.PI) / 180
const PITCH = (27 * Math.PI) / 180
const DIST = 9.5
const FOCAL = 5.6
/** Luz de la mesa: desde arriba, algo hacia F y R. */
const LIGHT: [number, number, number] = [0.42, 0.86, 0.58]

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

const CY = Math.cos(YAW)
const SY = Math.sin(YAW)
const CP = Math.cos(PITCH)
const SP = Math.sin(PITCH)

type V3 = [number, number, number]

/** Giro de la escena (yaw sobre Y, pitch sobre X). */
function turn(x: number, y: number, z: number): V3 {
  const x1 = x * CY + z * SY
  const z1 = -x * SY + z * CY
  const y2 = y * CP - z1 * SP
  const z2 = y * SP + z1 * CP
  return [x1, y2, z2]
}

/** Posición de la cámara en coordenadas del mundo. */
const EYE: V3 = (() => {
  const y1: V3 = [0, 0, DIST]
  const yp: V3 = [y1[0], y1[1] * CP + y1[2] * SP, -y1[1] * SP + y1[2] * CP]
  return [yp[0] * CY - yp[2] * SY, yp[1], yp[0] * SY + yp[2] * CY]
})()

function depthOf(v: V3): number {
  return DIST - v[2]
}

/** Proyección en pantalla (px de viewBox) con perspectiva. `mirrored` espeja la vista. */
function project(v: V3, mirrored: boolean): [number, number] {
  const s = (FOCAL / depthOf(v)) * UNIT
  return [mirrored ? -v[0] * s : v[0] * s, -v[1] * s]
}

export function proj(x: number, y: number, z: number, mirrored = false): [number, number] {
  return project(turn(x, y, z), mirrored)
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

function facesOf(cubie: { pos: V3; rot: number[] }, mirrored: boolean, index: number): Poly[] {
  const out: Poly[] = []
  const c = cubie.pos
  for (const ax of AXES) {
    const w = stickerNormal(cubie.rot, ax.face)
    // ¿mira hacia la cámara?
    const eye: V3 = [EYE[0] - (c[0] + w[0] * 0.5), EYE[1] - (c[1] + w[1] * 0.5), EYE[2] - (c[2] + w[2] * 0.5)]
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
    const tc = turn(cx, cy, cz)
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
      const tq = turn(q[0], q[1], q[2])
      zsum += tq[2]
      const [X, Y] = project(tq, mirrored)
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
}

export function Cube3D({ state, size = 260, mirrored = false, onFaceClick, onStickerDown, highlight = [], ghost }: Cube3DProps) {
  const polys: Poly[] = []
  state.cubies.forEach((c, i) => polys.push(...facesOf(c as { pos: V3; rot: number[] }, mirrored, i)))
  polys.sort((a, b) => a.depth - b.depth)

  const xs: number[] = []
  const ys: number[] = []
  for (const p of polys) {
    for (const pt of p.pts.split(' ')) {
      const [x, y] = pt.split(',').map(Number)
      xs.push(x)
      ys.push(y)
    }
  }
  const minX = xs.length ? Math.min(...xs) : -1
  const maxX = xs.length ? Math.max(...xs) : 1
  const minY = ys.length ? Math.min(...ys) : -1
  const maxY = ys.length ? Math.max(...ys) : 1
  const pad = 6
  const w = maxX - minX + pad * 2
  const h = maxY - minY + pad * 2
  const hl = new Set(highlight.map((p) => p.join(',')))
  const ghostKey = ghost ? ghost.join(',') : ''
  const interactive = Boolean(onStickerDown)

  return (
    <svg
      className={interactive ? 'cube3d interactive' : 'cube3d'}
      width={size}
      height={(size * h) / w}
      viewBox={`${minX - pad} ${minY - pad} ${w} ${h}`}
      role="img"
      aria-label="Cubo en tres dimensiones"
    >
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
              if (onStickerDown)
                onStickerDown({ index: p.index, face: p.face as 'U' | 'D' | 'L' | 'R' | 'F' | 'B', pos: p.pos, x: e.clientX, y: e.clientY })
              else if (onFaceClick) onFaceClick(p.face as 'U' | 'D' | 'L' | 'R' | 'F' | 'B')
            }}
            data-pos={p.pos.join(',')}
          />
        )
      })}
    </svg>
  )
}
