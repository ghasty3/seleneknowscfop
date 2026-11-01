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
const STRIP_T = 26
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

/**
 * Vista en red del cubo (la de cubedb, ruwix y Peety): la fila de abajo de la rejilla es la que
 * toca a F, la de arriba es la fila de atrás, y la columna 0 es el lado L. Es la convención que
 * hace que la cara U, las cuatro franjas laterales y las flechas hablen SIEMPRE de la misma pieza;
 * con la vista cenital pura la franja de F quedaba pegada a la fila de atrás (todo espejado).
 */
function cellXY(pos: Pos) {
  return { x: (pos[0] + 1) * U, y: (1 + pos[2]) * U }
}

/** Casilla de cada ranura de la última capa, en el orden de LL_CORNERS / LL_EDGES. */
function cellRing(ring: Pos[]): Record<number, { x: number; y: number }> {
  const out: Record<number, { x: number; y: number }> = {}
  ring.forEach((p, i) => (out[i] = cellXY(p)))
  return out
}
const CORNER_CELL = cellRing(LL_CORNERS)
const EDGE_CELL = cellRing(LL_EDGES)

/**
 * Pegatina lateral que se pinta en la casilla de cada ranura: las esquinas miran a F o a B y las
 * aristas a la suya. El orden es el de LL_CORNERS (UFR, UBR, UBL, UFL) y LL_EDGES (UF, UR, UB, UL),
 * y cada celda es la que `gridToPos` asigna de verdad a esa posición en esa cara.
 */
export const SIDE_CORNER: [Face, number, number][] = [['F', 0, 2], ['B', 0, 0], ['B', 0, 2], ['F', 0, 0]]
export const SIDE_EDGE: [Face, number, number][] = [['F', 0, 1], ['R', 0, 1], ['B', 0, 1], ['L', 0, 1]]

/**
 * Las 12 celdas de la corona (la fila pegada a cada una de las 4 caras), leídas en el orden en que
 * el diagrama las dibuja: F y B de izquierda a derecha, L y R de arriba abajo (arriba = atrás).
 * Exportado para que el audit compruebe en `gridToPos` que cada celda es la pegatina de la ranura
 * que dice ser: así es como se detecta un espejo o una cara torcida sin abrir el navegador.
 */
export const CROWN_CELLS: Record<'F' | 'B' | 'L' | 'R', [number, number][]> = {
  F: [0, 1, 2].map((c) => [0, c] as [number, number]),
  B: [0, 1, 2].map((c) => [0, 2 - c] as [number, number]),
  L: [0, 1, 2].map((r) => [0, 2 - r] as [number, number]),
  R: [0, 1, 2].map((r) => [0, r] as [number, number]),
}

// Lectura cenital estándar (la capa U se mira con F hacia abajo):
// fila 0 = fondo de la cara U, fila 2 = cerca del frente.
/* CORNER_CELL y EDGE_CELL se calculan ahora desde las propias LL_CORNERS/LL_EDGES (ver arriba). */

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
  const cPerm = pll ? permOf(state, LL_CORNERS) : null
  const ePerm = pll ? permOf(state, LL_EDGES) : null
  const cIdx = new Map(LL_CORNERS.map((p, i) => [p.join(), i]))
  const eIdx = new Map(LL_EDGES.map((p, i) => [p.join(), i]))

  // --- rejilla 3x3 de la cara U ---
  // Se recorre por POSICIONES (centro + las 8 piezas de la última capa), no por casillas sueltas:
  // así cada casilla sale de la misma posición que usan las flechas, las franjas y el audit.
  const cells: { x: number; y: number; fill: string; rx: number }[] = []
  const U9: Pos[] = [[0, 1, 0], ...LL_CORNERS, ...LL_EDGES]
  for (const pos of U9) {
    const { x, y } = cellXY(pos)
    const ci = cIdx.get(pos.join())
    const ei = eIdx.get(pos.join())
    let fill: string
    if (ci === undefined && ei === undefined) fill = m === 'oll' || pll ? FACE_HEX.U : CENTER
    else if (m === 'oll')
      fill = ci !== undefined
        ? llCornerOriented(state, pos)
          ? ORIENTED
          : UNORIENTED
        : llEdgeOriented(state, pos)
          ? FACE_HEX.U
          : UNORIENTED
    else if (pll) {
      // Cara de arriba SIEMPRE amarilla en PLL (decisión del proyecto): un PLL permuta la última
      // capa y no la tuerce, así que todas sus pegatinas de arriba son amarillas y el amarillo no
      // informa nada. Quién está movido lo dicen las cuatro franjas de los lados (pegatinas reales
      // de esas piezas) y las flechas del ciclo.
      fill = ORIENTED
    } else {
      const u = uCell(pos)
      fill = COLORS[faceletHome(state, 'U', u.row, u.col)] ?? DEAD
    }
    cells.push({ x, y, fill, rx: 8 })
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
    const CROWN_AT: Record<'F' | 'B' | 'L' | 'R', (i: number) => { x: number; y: number; w: number; h: number }> = {
      F: (c) => ({ x: c * U, y: 3 * U + STRIP_GAP, w: S, h: STRIP_T }),
      B: (c) => ({ x: c * U, y: -(STRIP_GAP + STRIP_T), w: S, h: STRIP_T }),
      L: (r) => ({ x: -(STRIP_GAP + STRIP_T), y: r * U, w: STRIP_T, h: S }),
      R: (r) => ({ x: 3 * U + STRIP_GAP, y: r * U, w: STRIP_T, h: S }),
    }
    for (const face of ['F', 'B', 'L', 'R'] as const)
      CROWN_CELLS[face].forEach(([row, col], i) => {
        const color = faceletHome(state, face, row, col)
        // En OLL las franjas laterales solo cuentan como «amarillo mirando a un lado».
        // El resto de colores de las caras del frente, atrás, izquierda y derecha son las
        // pegatinas de las capas de abajo: no informan de la orientación y ensucian el caso.
        const fill = m === 'oll' && color !== 'U' ? UNORIENTED : COLORS[color] ?? DEAD
        strips.push({ ...CROWN_AT[face](i), fill, key: `${face.toLowerCase()}${i}` })
      })
  } else {
    const stripY = 3 * U
    for (let c = 0; c < 3; c++) {
      const color = faceletHome(state, 'F', 0, c)
      const fill = COLORS[color] ?? DEAD
      strips.push({ x: c * U, y: stripY, w: S, h: S * 0.62, fill, key: `s${c}` })
    }
  }

  // --- flechas de permutación (PLL) ---
  // Una flecha va de la casilla donde está la pieza a la casilla que le corresponde (la punta
  // señala su casa). En los ciclos de 3 piezas salen las 3 flechas del ciclo; en un intercambio
  // antípodo (dos parejas opuestas, como el perm H) sale UNA línea con punta en los dos extremos.
  // El criterio de antípodas es geométrico y de involución: indices opuestos Y que la pieza
  // regresa al índice de origen. Con solo `perm[i] === (i+2)%4` un ciclo de 3 (p. ej. Ub, donde
  // pe[3]=1) se confundía con un swap y perdía una de sus tres flechas.
  const antipodalSwap = (perm: number[], i: number) => perm[perm[i]] === i && perm[i] === (i + 2) % 4
  const arrows: { shaft: string; head: string; tail?: string }[] = []
  if (pll) {
    const pc = cPerm!, pe = ePerm!
    const cornerPts = LL_CORNERS.map((_, i) => ({ x: CORNER_CELL[i].x + S / 2, y: CORNER_CELL[i].y + S / 2 }))
    const edgePts = LL_EDGES.map((_, i) => ({ x: EDGE_CELL[i].x + S / 2, y: EDGE_CELL[i].y + S / 2 }))
    for (let i = 0; i < 4; i++) {
      const a = stickerArrow(i, pc[i], cornerPts, antipodalSwap(pc, i))
      if (a) arrows.push(a)
    }
    for (let i = 0; i < 4; i++) {
      const a = stickerArrow(i, pe[i], edgePts, antipodalSwap(pe, i))
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
