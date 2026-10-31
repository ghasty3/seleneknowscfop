import { faceletHome, type CubeState, type Face } from '../cube/engine'
import { FACE_HEX } from '../cube/palette'
import { uCell, LL_CORNERS, LL_EDGES, llCornerOriented, llEdgeOriented, permOf, f2lPattern, SLOTS, type Pos } from '../cube/caseUtils'
import type { CaseDef } from '../data/types'

const COLORS: Record<string, string> = FACE_HEX

export interface Marker {
  pos: Pos
  kind: 'corner' | 'edge' | 'target' | 'home'
}

/** Modo del diagrama: qué se pinta. OLL = orientación; PLL = permutación con flechas. */
export type DiagramMode = 'auto' | 'oll' | 'pll' | 'f2l'

export function modeFor(def: CaseDef): DiagramMode {
  if (def.expect === 'oll') return 'oll'
  if (def.expect === 'pll') return 'pll'
  if (def.expect === 'f2l-top' || def.expect === 'f2l-slot') return 'f2l'
  return 'auto'
}

const S = 34 // lado de celda
const G = 4 // separación
const U = S + G // paso de celda
const CW = 3 * U // ancho de la rejilla de 3 celdas
const CX = 1.5 * U // centro de la cara U
const CY = 1.5 * U

/** Pegatina lateral de la corona del diagrama PLL: más fina que una casilla. */
const STRIP_T = 20
const STRIP_GAP = 6
const CROWN_OUT = 3 * U + STRIP_GAP + STRIP_T // borde exterior de la corona
/** Anillos de las flechas: pegados a la corona, y separados entre sí para que las flechas de
 *  esquinas y de aristas nunca se pisan en un PLL que permuta las dos cosas a la vez. */

/** Amarillo = la pegatina está orientada; gris = no lo está. Los dos únicos colores de OLL. */
const ORIENTED = FACE_HEX.U
const UNORIENTED = '#5b5468'
const DEAD = '#241f31' // celdas que no son última capa
const CENTER = '#3a3350' // centro de la cara (no informa)
const ARROW = '#ffffff' // flechas blancas con contorno negro
const HALO = '#000000' // contorno negro de las flechas

function cellXY(pos: Pos) {
  const { row, col } = uCell(pos)
  return { x: col * U, y: row * U }
}

// Lectura cenital estándar (la capa U se mira con F hacia abajo):
// fila 0 = fondo de la cara U, fila 2 = cerca del frente.
const CORNER_CELL: Record<number, { x: number; y: number }> = {
  0: { x: 0, y: 0 }, // UFR
  1: { x: 2 * U, y: 0 }, // UBR
  2: { x: 2 * U, y: 2 * U }, // UBL
  3: { x: 0, y: 2 * U }, // UFL
}
const EDGE_CELL: Record<number, { x: number; y: number }> = {
  0: { x: U, y: 0 }, // UF
  1: { x: 2 * U, y: U }, // UR
  2: { x: U, y: 2 * U }, // UB
  3: { x: 0, y: U }, // UL
}

/** Punta de flecha: triángulo relleno con el pico en (x,y) mirando según `ang`. */
function arrowHead(x: number, y: number, ang: number, L = 9, W = 4.2): string {
  const bx = x - L * Math.cos(ang)
  const by = y - L * Math.sin(ang)
  const px = -Math.sin(ang) * W
  const py = Math.cos(ang) * W
  return `M${x.toFixed(1)} ${y.toFixed(1)} L${(bx + px).toFixed(1)} ${(by + py).toFixed(1)} L${(bx - px).toFixed(1)} ${(by - py).toFixed(1)} Z`
}

type P = { x: number; y: number }

const TAIL_I = 0.3 * U // la flecha nace al salir de la pegatina de origen
const HEAD_I = 0.1 * U // y el pico entra en la pegatina de destino

/**
 * Flecha **recta** de permutación sobre la cara: nace en la pegatina de la pieza que viaja y
 * clava el pico en la pegatina de su destino. Sin curvas: la distancia entre las dos pegatinas
 * es la longitud de la flecha.
 * · intercambio del lado opuesto (a,b y b,a): una sola línea con punta en cada extremo, que es
 *   como se dibuja el PLL-H. Solo se dibuja una vez por pareja (from < to).
 * Devuelve trazo, punta y (en el intercambio) punta de arranque, por separado.
 */
function stickerArrow(from: number, to: number, pts: P[], swap: boolean): { shaft: string; head: string; tail?: string } | null {
  if (from === to) return null
  if (swap && from > to) return null
  const p0 = pts[from]
  const p1 = pts[to]
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const dist = Math.hypot(dx, dy)
  if (dist < 2) return null
  const ux = dx / dist
  const uy = dy / dist
  const sx = p0.x + ux * TAIL_I
  const sy = p0.y + uy * TAIL_I
  const ex = p1.x - ux * HEAD_I
  const ey = p1.y - uy * HEAD_I
  const ang = Math.atan2(uy, ux)
  return {
    shaft: `M${sx.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`,
    head: arrowHead(ex, ey, ang),
    tail: swap ? arrowHead(sx, sy, ang + Math.PI) : undefined,
  }
}

/**
 * Vista cenital de la última capa. Dos modos, ordenados y sin ruido:
 * · `oll` — solo recuadros: amarillo = orientado, gris = sin orientar, con la tira frontal.
 * · `pll` — cara amarilla entera (centro incluido) + **corona de las 12 pegatinas laterales**
 *   (los cuatro lados, que es donde se lee un PLL) + flechas de permutación en dos anillos:
 *   esquinas en el anillo exterior, aristas en el interior, ancladas en la pieza y con el pico
 *   en su destino. Todo el dibujo entra en el viewBox, así que ninguna flecha queda recortada.
 * `f2l` / `auto` mantienen la lectura por colores de pegatina con marcadores.
 */
export function CaseDiagram({
  state,
  markers = [],
  mode = 'auto',
  size = 140,
  label,
}: {
  state: CubeState
  markers?: Marker[]
  mode?: DiagramMode
  size?: number
  label?: string
}) {
  const m = mode === 'auto' ? 'auto' : mode
  const pll = m === 'pll'

  // --- rejilla 3x3 de la cara U ---
  const cells: { x: number; y: number; fill: string; rx: number }[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const key = `${r}${c}`
      let fill = DEAD
      if (key === '11') fill = m === 'oll' || pll ? FACE_HEX.U : CENTER
      else if (m === 'oll' && (key === '00' || key === '02' || key === '20' || key === '22')) {
        const pos: Pos = key === '00' ? [1, 1, 1] : key === '02' ? [1, 1, -1] : key === '20' ? [-1, 1, 1] : [-1, 1, -1]
        fill = llCornerOriented(state, pos) ? ORIENTED : UNORIENTED
      } else if (m === 'oll' && (key === '01' || key === '10' || key === '12' || key === '21')) {
        const pos: Pos = key === '01' ? [0, 1, 1] : key === '10' ? [-1, 1, 0] : key === '12' ? [1, 1, 0] : [0, 1, -1]
        fill = llEdgeOriented(state, pos) ? FACE_HEX.U : UNORIENTED
      } else if (pll) {
        fill = ORIENTED
      } else {
        const color = faceletHome(state, 'U', r, c)
        fill = COLORS[color] ?? DEAD
      }
      cells.push({ x: c * U, y: r * U, fill, rx: 8 })
    }
  }

  // --- corona de pegatinas laterales (PLL) / tira frontal (los demás modos) ---
  // En cenital con F abajo: la fila de atrás se lee con las columnas del B invertidas, y las
  // tiras izquierda y derecha se leen de arriba abajo con la fila 0 de L y de R.
  type StripCell = { x: number; y: number; w: number; h: number; fill: string; key: string }
  const strips: StripCell[] = []
  // La corona de las 4 caras adyacentes va en PLL y en OLL: en OLL es la que cuenta la
  // orientación (una pegatina amarilla en un lado = esa pieza está mal orientada), así que
  // mostrar solo la tira de abajo dejaba la mitad de la información fuera del dibujo.
  const crown = pll || m === 'oll'
  if (crown) {
    for (let c = 0; c < 3; c++) strips.push({ x: c * U, y: 3 * U + STRIP_GAP, w: S, h: STRIP_T, fill: COLORS[faceletHome(state, 'F', 0, c)] ?? DEAD, key: `f${c}` })
    for (let c = 0; c < 3; c++) strips.push({ x: c * U, y: -(STRIP_GAP + STRIP_T), w: S, h: STRIP_T, fill: COLORS[faceletHome(state, 'B', 0, 2 - c)] ?? DEAD, key: `b${c}` })
    for (let r = 0; r < 3; r++) strips.push({ x: -(STRIP_GAP + STRIP_T), y: r * U, w: STRIP_T, h: S, fill: COLORS[faceletHome(state, 'L', r, 0)] ?? DEAD, key: `l${r}` })
    for (let r = 0; r < 3; r++) strips.push({ x: 3 * U + STRIP_GAP, y: r * U, w: STRIP_T, h: S, fill: COLORS[faceletHome(state, 'R', r, 0)] ?? DEAD, key: `r${r}` })
  } else {
    const stripY = 3 * U
    for (let c = 0; c < 3; c++) {
      const color = faceletHome(state, 'F', 0, c)
      const fill = COLORS[color] ?? DEAD
      strips.push({ x: c * U, y: stripY, w: S, h: S * 0.62, fill, key: `s${c}` })
    }
  }

  // --- flechas de permutación (PLL) ---
  const arrows: { shaft: string; head: string; tail?: string }[] = []
  if (pll) {
    const cornerPts = LL_CORNERS.map((_, i) => ({ x: CORNER_CELL[i].x + S / 2, y: CORNER_CELL[i].y + S / 2 }))
    const edgePts = LL_EDGES.map((_, i) => ({ x: EDGE_CELL[i].x + S / 2, y: EDGE_CELL[i].y + S / 2 }))
    const cPerm = permOf(state, LL_CORNERS)
    for (let i = 0; i < 4; i++) {
      const a = stickerArrow(i, cPerm[i], cornerPts, cPerm[i] === (i + 2) % 4)
      if (a) arrows.push(a)
    }
    const ePerm = permOf(state, LL_EDGES)
    for (let i = 0; i < 4; i++) {
      const a = stickerArrow(i, ePerm[i], edgePts, ePerm[i] === (i + 2) % 4)
      if (a) arrows.push(a)
    }
  }
  // Caja cuadrada centrada en la cara: las flechas van sobre la cara, así que el diagrama
  // mide lo que mide la corona (los anillos exteriores ya no existen).
  const half = CROWN_OUT - CX + 4
  const top = crown ? CY - half : -6
  const bottom = crown ? CY + half : 3 * U + S * 0.62 + 6
  const left = crown ? CX - half : 0
  const right = crown ? CX + half : CW
  const width = right - left
  const height = bottom - top
  const cls = ['diagram', m === 'oll' && 'oll', pll && 'pll'].filter(Boolean).join(' ')

  return (
    <svg
      className={cls}
      width={size}
      height={(size * height) / width}
      viewBox={`${left} ${top} ${width} ${height}`}
      role="img"
      aria-label={label ?? (pll ? 'Diagrama de permutación con flechas' : 'Diagrama de orientación')}
    >
      {cells.map((c, i) => (
        <rect key={`u${i}`} x={c.x} y={c.y} width={S} height={S} rx={c.rx} fill={c.fill} className="dcell" />
      ))}
      {strips.map((c) => (
        <rect key={c.key} x={c.x} y={c.y} width={c.w} height={c.h} rx={7} fill={c.fill} className="dcell side" />
      ))}
      {pll && (
        <g className="pll-arrows">
          {arrows.map((a, i) => (
            <g key={`a${i}`}>
              {/* halo oscuro debajo del trazo: el morado se lee sobre el amarillo */}
              <path d={a.shaft} fill="none" stroke={HALO} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
              <path d={a.shaft} fill="none" stroke={ARROW} strokeWidth={2.8} strokeLinecap="round" />
              <path d={a.head} fill={ARROW} stroke={HALO} strokeWidth={1} />
              {a.tail && <path d={a.tail} fill={ARROW} stroke={HALO} strokeWidth={1} />}
            </g>
          ))}
        </g>
      )}
      {markers.map((mk, i) => {
        const { x, y } = cellXY(mk.pos)
        const cx = x + S / 2
        const cy = y + S / 2
        if (mk.kind === 'target')
          return (
            <g key={i} className="mk-target">
              <rect x={x + 3} y={y + 3} width={S - 6} height={S - 6} rx={7} />
              <path d={`M${cx - 7} ${cy - 5} L${cx + 7} ${cy - 5} L${cx} ${cy + 7} Z`} />
            </g>
          )
        if (mk.kind === 'home') return <rect key={i} x={x + 4} y={y + 4} width={S - 8} height={S - 8} rx={7} className="mk-home" />
        return <rect key={i} x={x + 3} y={y + 3} width={S - 6} height={S - 6} rx={7} className={mk.kind === 'corner' ? 'mk-corner' : 'mk-edge'} />
      })}
    </svg>
  )
}

/** Marcadores automáticos del caso: qué debe mirar el usuario en el diagrama. */
export function caseMarkers(def: CaseDef, state: CubeState): Marker[] {
  try {
    if (def.expect === 'oll' || def.expect === 'pll') return []
    const f = f2lPattern(state)
    if (f.slot < 0) return []
    const slot = SLOTS[f.slot]
    const m: Marker[] = [
      { pos: [slot.corner[0], 1, slot.corner[2]], kind: 'target' },
      { pos: [slot.edge[0], 1, slot.edge[2]], kind: 'target' },
    ]
    if (f.cornerAt && f.cornerAt[1] === 1) m.push({ pos: f.cornerAt, kind: 'corner' })
    if (f.edgeAt && f.edgeAt[1] === 1) m.push({ pos: f.edgeAt, kind: 'edge' })
    return m
  } catch {
    return []
  }
}
