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

/** Amarillo = la pegatina está orientada; gris = no lo está. Los dos únicos colores de OLL. */
const ORIENTED = FACE_HEX.U
const UNORIENTED = '#5b5468'
const DEAD = '#241f31' // celdas que no son última capa
const CENTER = '#3a3350' // centro de la cara (no informa)
const ARROW = '#9a6bff' // acento morado oscuro: las flechas de permutación

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

/** Arco con punta: de x1 (salida) a x2 (llegada), con panza de altura h. Flecha de permutación. */
function arrowPath(x1: number, x2: number, base: number, h: number, up: boolean): string {
  const cx = (x1 + x2) / 2
  const cy = base + (up ? -h : h)
  const y1 = base + 4
  const y2 = base + (up ? -4 : 4)
  const dx = x2 - x1
  if (Math.abs(dx) < 1) return ''
  const path = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`
  let tx = 2 * (x2 - cx)
  let ty = 2 * (y2 - cy)
  const m = Math.hypot(tx, ty) || 1
  tx /= m
  ty /= m
  const px = -ty
  const py = tx
  const head = `M${x2} ${y2} L${x2 - 11 * tx + 5.5 * px} ${y2 - 11 * ty + 5.5 * py} L${x2 - 11 * tx - 5.5 * py} ${y2 - 11 * ty + 5.5 * px} Z`
  return path + ' ' + head
}

/**
 * Altura del arco según la distancia de la pieza dentro del anillo. Los arcos son cúbicos
 * `M a,base C a,base-h  b,base-h  b,base`, así que su punto más alto queda a `h/2` del base:
 * con h<28 las flechas vecinas (d=1) nacen tapadas por las propias casillas y solo se veía
 * la del salto del lado opuesto.
 */
function arcHeight(from: number, to: number): number {
  const d = Math.min(Math.abs(to - from), 4 - Math.abs(to - from))
  return d === 1 ? 30 : d === 2 ? 44 : 37
}

/**
 * Vista cenital de la última capa. Dos modos, ordenados y sin ruido:
 * · `oll` — solo recuadros: amarillo = orientado, gris = sin orientar.
 * · `pll` — recuadros amarillos (todo orientado) + FLECHAS por encima (esquinas)
 *   y por debajo (aristas) que dibujan la permutación.
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

  // --- rejilla 3x3 de la cara U ---
  const cells: { x: number; y: number; fill: string; rx: number }[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const key = `${r}${c}`
      let fill = DEAD
      if (key === '11') fill = m === 'pll' ? CENTER : m === 'oll' ? FACE_HEX.U : CENTER
      else if (m === 'oll' && (key === '00' || key === '02' || key === '20' || key === '22')) {
        const pos: Pos = key === '00' ? [1, 1, 1] : key === '02' ? [1, 1, -1] : key === '20' ? [-1, 1, 1] : [-1, 1, -1]
        fill = llCornerOriented(state, pos) ? ORIENTED : UNORIENTED
      } else if (m === 'oll' && (key === '01' || key === '10' || key === '12' || key === '21')) {
        const pos: Pos = key === '01' ? [0, 1, 1] : key === '10' ? [-1, 1, 0] : key === '12' ? [1, 1, 0] : [0, 1, -1]
        fill = llEdgeOriented(state, pos) ? ORIENTED : UNORIENTED
      } else if (m === 'pll' && (key === '00' || key === '01' || key === '02' || key === '10' || key === '12' || key === '20' || key === '21' || key === '22')) {
        fill = ORIENTED
      } else {
        const color = faceletHome(state, 'U', r, c)
        fill = COLORS[color] ?? DEAD
      }
      cells.push({ x: c * U, y: r * U, fill, rx: 8 })
    }
  }

  // --- tira frontal: pegatinas laterales de las aristas de la capa U (capa D vista) ---
  const stripY = 3 * U
  const strip: { x: number; fill: string; key: string }[] = []
  for (let c = 0; c < 3; c++) {
    const color = faceletHome(state, 'F', 0, c)
    const fill = m === 'oll' && c !== 1 ? (llEdgeOriented(state, [c - 1, 1, 1]) ? FACE_HEX.U : UNORIENTED) : COLORS[color] ?? DEAD
    strip.push({ x: c * U, fill, key: `s${c}` })
  }

  // --- flechas de permutación (PLL) ---
  const arrows: string[] = []
  if (m === 'pll') {
    const cPerm = permOf(state, LL_CORNERS)
    for (let i = 0; i < 4; i++) {
      const to = cPerm[i]
      if (to < 0 || to === i) continue
      if (to > i && cPerm[to] === i) {
        // ciclo de 2: una sola flecha
      }
      const a = CORNER_CELL[i]
      const b = CORNER_CELL[to]
      arrows.push(arrowPath(a.x + S / 2, b.x + S / 2, 26, arcHeight(i, to), true))
    }
    const ePerm = permOf(state, LL_EDGES)
    const stripX: Record<number, number> = { 0: U + S / 2, 1: 2 * U + S / 2, 2: 3 * U + S / 2, 3: S / 2 }
    const base = 168 // por debajo de la tira frontal: la flecha nace en la casilla y el arco
    // asoma por debajo de la tira (con el base pegado a la tira las vecinas quedaban tapadas)
    for (let i = 0; i < 4; i++) {
      const to = ePerm[i]
      if (to < 0 || to === i) continue
      arrows.push(arrowPath(stripX[i], stripX[to], base, arcHeight(i, to), false))
    }
  }

  const width = CW
  const bodyH = 3 * U + S * 0.62
  // Margen para las flechas: las de esquinas salen por encima de la rejilla y las de aristas
  // por debajo de la tira frontal. El alto del svg se calcula sobre ESTE viewBox, así que
  // nada de lo dibujado queda fuera del área visible (antes el contenedor estiraba el svg y
  // las flechas desaparecían recortadas).
  const top = m === 'pll' ? -52 : -6
  const bottom = m === 'pll' ? 52 : 6
  const height = bodyH - top + bottom
  const cls = ['diagram', m === 'oll' && 'oll', m === 'pll' && 'pll'].filter(Boolean).join(' ')

  return (
    <svg
      className={cls}
      width={size}
      height={(size * height) / width}
      viewBox={`0 ${top} ${width} ${height}`}
      role="img"
      aria-label={label ?? (m === 'pll' ? 'Diagrama de permutación con flechas' : 'Diagrama de orientación')}
    >
      {cells.map((c, i) => (
        <rect key={`u${i}`} x={c.x} y={c.y} width={S} height={S} rx={c.rx} fill={c.fill} className="dcell" />
      ))}
      {strip.map((c) => (
        <rect key={c.key} x={c.x} y={stripY} width={S} height={S * 0.62} rx={7} fill={c.fill} className="dcell side" />
      ))}
      {m === 'pll' && (
        <g className="pll-arrows">
          {arrows
            .filter(Boolean)
            .map((d, i) => <path key={`a${i}`} d={d} fill={ARROW} stroke={ARROW} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />)}
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
