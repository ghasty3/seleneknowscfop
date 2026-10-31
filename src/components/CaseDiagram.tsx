import { faceletHome, type CubeState, type Face } from '../cube/engine'
import { FACE_HEX } from '../cube/palette'
import { uCell, type Pos } from '../cube/caseUtils'

const COLORS: Record<string, string> = FACE_HEX

export interface Marker {
  pos: Pos
  kind: 'corner' | 'edge' | 'target' | 'home'
}

const S = 34 // lado de celda
const G = 4 // separación

function cellXY(pos: Pos) {
  const { row, col } = uCell(pos)
  return { x: col * (S + G), y: row * (S + G) }
}

/**
 * Vista cenital de la capa superior (la que se resuelve en OLL/PLL) y, debajo,
 * la fila frontal con sus pegatinas laterales. Los marcadores dibujan qué mira
 * el usuario: la esquina, la arista y el hueco.
 */
export function CaseDiagram({
  state,
  markers = [],
  size = 140,
  label,
}: {
  state: CubeState
  markers?: Marker[]
  size?: number
  label?: string
}) {
  const cells: { x: number; y: number; fill: string }[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const color = faceletHome(state, 'U', r, c)
      cells.push({ x: c * (S + G), y: r * (S + G), fill: COLORS[color] ?? 'transparent' })
    }
  }
  // fila frontal (F, fila 0) pegatinas laterales -> tira bajo la capa U
  const front: { x: number; fill: string }[] = []
  for (let c = 0; c < 3; c++) {
    const color = faceletHome(state, 'F', 0, c)
    front.push({ x: c * (S + G), fill: COLORS[color] ?? 'transparent' })
  }
  const rowsRight = ['R', 'L'].map((f) => {
    const col: Face = f as Face
    return [0, 1, 2].map((r) => COLORS[faceletHome(state, col, r, 0)] ?? 'transparent')
  })
  const width = 3 * (S + G) + (S + G) * 2
  const height = 3 * (S + G) + S + G
  const offR = 3 * (S + G)
  const offL = -(S + G)

  return (
    <svg className="diagram" width={size} height={(size * height) / width} viewBox={`${offL} -6 ${width} ${height + 6}`} role="img" aria-label={label ?? 'Diagrama de la capa superior'}>
      {cells.map((c, i) => (
        <rect key={`u${i}`} x={c.x} y={c.y} width={S} height={S} rx={7} fill={c.fill} className="dcell" />
      ))}
      {front.map((c, i) => (
        <rect key={`f${i}`} x={c.x} y={3 * (S + G)} width={S} height={S * 0.62} rx={6} fill={c.fill} className="dcell side" />
      ))}
      {rowsRight[0].map((f, i) => (
        <rect key={`r${i}`} x={offR} y={i * (S + G)} width={S * 0.62} height={S} rx={6} fill={f} className="dcell side" />
      ))}
      {rowsRight[1].map((f, i) => (
        <rect key={`l${i}`} x={offL} y={i * (S + G)} width={S * 0.62} height={S} rx={6} fill={f} className="dcell side" />
      ))}
      {markers.map((m, i) => {
        const { x, y } = cellXY(m.pos)
        const cx = x + S / 2
        const cy = y + S / 2
        if (m.kind === 'corner')
          return <circle key={i} cx={cx} cy={cy} r={S * 0.33} className="mk-corner" />
        if (m.kind === 'edge') return <circle key={i} cx={cx} cy={cy} r={S * 0.3} className="mk-edge" />
        if (m.kind === 'target')
          return (
            <g key={i} className="mk-target">
              <rect x={x + 3} y={y + 3} width={S - 6} height={S - 6} rx={6} />
              <path d={`M${cx - 7} ${cy - 5} L${cx + 7} ${cy - 5} L${cx} ${cy + 7} Z`} />
            </g>
          )
        return <rect key={i} x={x + 4} y={y + 4} width={S - 8} height={S - 8} rx={6} className="mk-home" />
      })}
    </svg>
  )
}

import { SLOTS, f2lPattern, llCornerOriented, llEdgeOriented, LL_CORNERS, LL_EDGES, permOf } from '../cube/caseUtils'
import type { CaseDef } from '../data/types'

/** Marcadores automáticos del caso: qué debe mirar el usuario en el diagrama. */
export function caseMarkers(def: CaseDef, state: CubeState): Marker[] {
  try {
    if (def.expect === 'oll') {
      const m: Marker[] = []
      for (const p of LL_EDGES) if (!llEdgeOriented(state, p)) m.push({ pos: p, kind: 'edge' })
      for (const p of LL_CORNERS) if (!llCornerOriented(state, p)) m.push({ pos: p, kind: 'corner' })
      return m
    }
    if (def.expect === 'pll') {
      const m: Marker[] = []
      for (const p of LL_CORNERS) if (!atHomeRing(state, LL_CORNERS, p)) m.push({ pos: p, kind: 'corner' })
      for (const p of LL_EDGES) if (!atHomeRing(state, LL_EDGES, p)) m.push({ pos: p, kind: 'edge' })
      return m
    }
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

function atHomeRing(state: CubeState, ring: Pos[], p: Pos): boolean {
  const perm = permOf(state, ring)
  const i = ring.findIndex((q) => q[0] === p[0] && q[1] === p[1] && q[2] === p[2])
  return i >= 0 && perm[i] === i
}
