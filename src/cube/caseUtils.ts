import {
  caseState,
  cloneState,
  cubieIdentity,
  faceletHome,
  frontGrid,
  isSolved,
  parseAlg,
  solvedState,
  topGrid,
  applyMoves,
  algToString,
  invertMoves,
  frameMatrix,
  transpose,
  mulMat,
  applyVec,
  stateFromAlg,
  type CubeState,
  type Face,
  type Mat,
} from './engine'

/**
 * Utilidades de patrón: derivan del estado la información que muestran las
 * fichas (diagramas, grupos, firmas de PLL). Todo se calcula, nada a mano.
 */

export type PermKind = 'id' | 'adj' | 'diag' | 'cycle3' | 'cycle4' | 'swap2a' | 'swap2o'

export type Pos = [number, number, number]

const key = (p: Pos) => `${p[0]},${p[1]},${p[2]}`

// Anillo de la última capa (sentido horario visto desde arriba)
export const LL_EDGES: Pos[] = [
  [0, 1, 1], // UF
  [1, 1, 0], // UR
  [0, 1, -1], // UB
  [-1, 1, 0], // UL
]
export const LL_CORNERS: Pos[] = [
  [1, 1, 1], // UFR
  [1, 1, -1], // UBR
  [-1, 1, -1], // UBL
  [-1, 1, 1], // UFL
]

export const SLOTS: { name: string; corner: Pos; edge: Pos }[] = [
  { name: 'FR', corner: [1, -1, 1], edge: [1, 0, 1] },
  { name: 'FL', corner: [-1, -1, 1], edge: [-1, 0, 1] },
  { name: 'BR', corner: [1, -1, -1], edge: [1, 0, -1] },
  { name: 'BL', corner: [-1, -1, -1], edge: [-1, 0, -1] },
]

export const CROSS_EDGES: Pos[] = [
  [0, -1, 1],
  [1, -1, 0],
  [0, -1, -1],
  [-1, -1, 0],
]

/** Pares (cara vista desde arriba) para cada posición: row = 1 - z, col = x + 1 */
export function uCell(p: Pos): { row: number; col: number } {
  return { row: 1 - p[2], col: p[0] + 1 }
}

// ---------- estado / cubies ----------

function cubieAt(s: CubeState, p: Pos) {
  return s.cubies.find((c) => c.pos[0] === p[0] && c.pos[1] === p[1] && c.pos[2] === p[2])
}

const HOME_BY_COLORS = new Map<string, string>()
{
  for (const c of solvedState().cubies) {
    const k = cubieIdentity(c).colors.slice().sort().join('')
    HOME_BY_COLORS.set(k, key(c.pos))
  }
}

function isIdentityRot(rot: number[]): boolean {
  for (let i = 0; i < 9; i++) if (rot[i] !== (i % 4 === 0 ? 1 : 0)) return false
  return true
}

/** ¿La pieza está en su casa y bien orientada? */
export function pieceAtHome(s: CubeState, p: Pos): boolean {
  const c = cubieAt(s, p)
  if (!c) return false
  const k = cubieIdentity(c).colors.slice().sort().join('')
  return HOME_BY_COLORS.get(k) === key(p) && isIdentityRot(c.rot)
}

function countNonZero(p: Pos): number {
  return p.filter((v) => v !== 0).length
}

/**
 * ¿Están las dos primeras capas resueltas EN ESTAS COORDENADAS? Excluye por IDENTIDAD de
 * pieza (las de la última capa, casa y = -1), no por posición: la versión de arriba excluye la
 * capa de arriba, así que con la última capa abajo (plantado con preparación escrita) contaba
 * las piezas revueltas de la última capa como F2L y devolvía false en las 24 rotaciones.
 */
export function f2lSolvedHere(s: CubeState): boolean {
  for (const c of s.cubies) {
    if (countNonZero(c.pos) === 1) continue // centros
    if (c.home[1] === -1) continue // piezas de la última capa (color opuesto a la cruz)
    if (key(c.pos) !== key(c.home)) return false
    if (!isIdentityRot(c.rot)) return false
  }
  return true
}

/** Piezas de las dos primeras capas (todo lo que no es capa U ni centros). */
export function f2lSolved(s: CubeState): boolean {
  for (const c of s.cubies) {
    const nz = countNonZero(c.pos)
    if (nz === 1) continue // centros
    if (c.pos[1] === 1) continue // capa U
    const k = cubieIdentity(c).colors.slice().sort().join('')
    if (HOME_BY_COLORS.get(k) !== key(c.pos)) return false
    if (!isIdentityRot(c.rot)) return false
  }
  return true
}

export function crossSolved(s: CubeState): boolean {
  return CROSS_EDGES.every((p) => pieceAtHome(s, p))
}

/**
 * ¿Está la última capa arriba? Es una comprobación ESTRUCTURAL, no de colores: las piezas
 * propias de la última capa son las 8 que no son de F2L, y la vista es canónica cuando esas 8
 * son exactamente las que están en la capa de arriba. `f2lSolvedRel` no sirve para esto: su
 * heurística llama «última capa» a la capa superior por convención de colores, y un plantado
 * con preparación (`x'`) la tiene abajo, por eso `canonicalView` nunca encontraba el giro.
 */
export function llLayerIsTop(s: CubeState): boolean {
  // Identidades de las piezas de la última capa: por FIRMAS DE COLOR, no por posición. Comparar
  // claves de posición era trivialmente verdadero (las 8 posiciones de arriba coinciden siempre
  // con las 8 claves de la anilla), así que devolvía `true` para cualquier rotación.
  // La última capa es la del color OPUSTO al de la cruz: en este modelo la cruz blanca está en
  // casa con y = +1, así que las piezas de la última capa son las que tienen casa con y = -1.
  const llKeys = new Set<string>()
  for (const c of solvedState().cubies) {
    if (countNonZero(c.home) < 2) continue
    if (c.home[1] !== -1) continue
    llKeys.add(cubieIdentity(c).colors.slice().sort().join(''))
  }
  const top = s.cubies.filter((c) => countNonZero(c.pos) > 1 && c.pos[1] === 1)
  return top.length === 8 && top.every((c) => llKeys.has(cubieIdentity(c).colors.slice().sort().join('')))
}

/** Orientación: el sticker del color de la cara `face` está en esa cara. */
export function llEdgeOriented(s: CubeState, p: Pos): boolean {
  const { row, col } = uCell(p)
  return faceletHome(s, 'U', row, col) === 'U'
}

export function llCornerOriented(s: CubeState, p: Pos): boolean {
  const { row, col } = uCell(p)
  return faceletHome(s, 'U', row, col) === 'U'
}

// ---------- permutaciones ----------

export function permOf(s: CubeState, ring: Pos[]): number[] {
  return ring.map((p) => {
    const c = cubieAt(s, p)
    if (!c) return -1
    const k = cubieIdentity(c).colors.slice().sort().join('')
    const homeKey = HOME_BY_COLORS.get(k)
    return ring.findIndex((q) => key(q) === homeKey)
  })
}

/** Clasifica la permutación de 4 piezas del anillo. */
export function permKind(perm: number[]): PermKind {
  const id = perm.every((v, i) => v === i)
  if (id) return 'id'
  // descomposición en ciclos
  const seen = new Set<number>()
  const cycles: number[][] = []
  for (let i = 0; i < perm.length; i++) {
    if (seen.has(i)) continue
    const cyc: number[] = []
    let j = i
    while (!seen.has(j)) {
      seen.add(j)
      cyc.push(j)
      j = perm[j]
    }
    cycles.push(cyc)
  }
  const sorted = [...cycles].sort((a, b) => b.length - a.length)
  if (sorted.length === 1 && sorted[0].length === 4) return 'cycle4'
  if (sorted.length === 2 && sorted[0].length === 3) return 'cycle3'
  if (sorted.length === 2 && sorted.every((c) => c.length === 2)) {
    // dos transposiciones: ¿parejas vecinas (0,1)&(2,3) o opuestas (0,2)&(1,3)?
    const flat = sorted.flat().slice().sort((a, b) => a - b)
    const pairs = sorted.map((c) => c.slice().sort((a, b) => a - b))
    const adjacent = pairs.some(([a, b]) => (a + b) % 2 === 1)
    void flat
    return adjacent ? 'swap2a' : 'swap2o'
  }
  if (sorted.length === 1 && sorted[0].length === 2) {
    const [a, b] = sorted[0]
    return (a + b) % 2 === 1 ? 'adj' : 'diag'
  }
  return 'cycle3'
}

export const PERM_LABEL: Record<PermKind, string> = {
  id: 'colocadas',
  adj: 'intercambio de vecinas',
  diag: 'intercambio diagonal',
  cycle3: 'ciclo de 3',
  cycle4: 'ciclo de 4',
  swap2a: 'dos parejas vecinas',
  swap2o: 'dos parejas opuestas',
}

// ---------- patrones ----------

export type EdgeShape = 'cross' | 'bar' | 'L' | 'dot'

export const EDGE_SHAPE_LABEL: Record<EdgeShape, string> = {
  cross: 'cruz hecha',
  bar: 'barra',
  L: 'L',
  dot: 'punto',
}

export interface OllPattern {
  edges: EdgeShape
  flipped: number
  unorientedCorners: number
  cornerTwists: boolean[]
  twoLookReady: boolean
}

export function ollPattern(s: CubeState): OllPattern {
  const oriented = LL_EDGES.map((p) => llEdgeOriented(s, p))
  const done = oriented.filter(Boolean).length
  const flipped = 4 - done
  let edges: EdgeShape = 'dot'
  if (done === 4) edges = 'cross'
  else if (done === 0) edges = 'dot'
  else {
    // 2 orientadas: opuestas (UF/UB o UR/UL) = barra, contiguas = L
    const idx = oriented.map((o, i) => (o ? i : -1)).filter((i) => i >= 0)
    edges = (idx[0] + idx[1]) % 2 === 0 ? 'bar' : 'L'
  }
  const cornerTwists = LL_CORNERS.map((p) => !llCornerOriented(s, p))
  const unorientedCorners = cornerTwists.filter(Boolean).length
  return { edges, flipped, unorientedCorners, cornerTwists, twoLookReady: true }
}

export interface PllPattern {
  corners: PermKind
  edges: PermKind
  headlights: number
}

export function pllPattern(s: CubeState): PllPattern {
  const corners = permKind(permOf(s, LL_CORNERS))
  const edges = permKind(permOf(s, LL_EDGES))
  // faros: pegatinas laterales del anillo U que coinciden con el centro de esa cara
  let headlights = 0
  const cols = ['F', 'R', 'B', 'L'] as Face[]
  cols.forEach((face, i) => {
    const side = faceletHome(s, face, 0, 1)
    if (side === face) headlights++
    void i
  })
  return { corners, edges, headlights }
}

export type F2lSlotState = 'vacio' | 'torcido' | 'bloqueado' | 'hecho'

export interface F2lPattern {
  slot: number // índice del hueco objetivo
  cornerAt: Pos | null
  edgeAt: Pos | null
  slotState: F2lSlotState
  crossOk: boolean
}

const SLOT_LABEL = SLOTS.map((s) => s.name)
export { SLOT_LABEL }

/**
 * Patrón F2L: la esquina y la arista blancas (sticker 'D') y el hueco al que
 * pertenecen. `cornerAt`/`edgeAt` son las posiciones actuales de esas dos piezas.
 */
export function f2lPattern(s: CubeState): F2lPattern {
  const whiteCornerPos: Pos[] = []
  const whiteEdgePos: Pos[] = []
  for (const c of s.cubies) {
    const id = cubieIdentity(c)
    if (!id.colors.includes('D')) continue
    if (id.kind === 'corner') whiteCornerPos.push(c.pos as Pos)
    else if (id.kind === 'edge') whiteEdgePos.push(c.pos as Pos)
  }
  // hueco objetivo: el que se corresponde con la esquina blanca
  let slot = -1
  const corner = whiteCornerPos[0]
  if (corner) {
    const c = cubieAt(s, corner)!
    const colors = cubieIdentity(c).colors.filter((x) => x !== 'D').sort().join('')
    slot = SLOTS.findIndex((sl) => {
      const cc = cubieAt(solvedState(), sl.corner)!
      return cubieIdentity(cc).colors.filter((x) => x !== 'D').sort().join('') === colors
    })
  }
  const edge = whiteEdgePos[0]
  const inTop = corner?.[1] === 1 && edge?.[1] === 1
  let slotState: F2lSlotState = 'vacio'
  if (slot >= 0) {
    const sl = SLOTS[slot]
    const cornerHome = pieceAtHome(s, sl.corner)
    const edgeHome = pieceAtHome(s, sl.edge)
    const foreignCorner = cornerHome ? false : true
    const foreignEdge = edgeHome ? false : true
    if (cornerHome && edgeHome) slotState = 'hecho'
    else if (!foreignCorner && !foreignEdge) slotState = 'hecho'
    else {
      const ownCornerInSlot = pieceAtHome(s, sl.corner)
      const ownEdgeInSlot = pieceAtHome(s, sl.edge)
      slotState = ownCornerInSlot || ownEdgeInSlot ? 'torcido' : 'bloqueado'
      if (inTop) slotState = 'vacio'
    }
  }
  return {
    slot,
    cornerAt: corner ?? null,
    edgeAt: edge ?? null,
    slotState,
    crossOk: crossSolved(s),
  }
}

// ---------- comprobaciones de estructura para verify.mts ----------

const ROT_WORDS = (() => {
  const ax = ['x', 'y', 'z']
  const pow = ['', '2', "'"]
  const out: string[] = ['']
  for (const a of ax) for (const b of ax) for (const c of ax)
    for (const pa of pow) for (const pb of pow) for (const pc of pow) out.push(`${a}${pa} ${b}${pb} ${c}${pc}`)
  return [...new Set(out.map((w) => algToString(parseAlg(w))))]
})()

/** Gira el cubo entero al marco que marcan los centros (cruz abajo, última capa arriba). */
export function canonicalByFrame(base: CubeState): { state: CubeState; rot: string } {
  const F = frameMatrix(base)
  if (!F) return { state: base, rot: '' }
  const G = transpose(F)
  const state = cloneState(base)
  for (const c of state.cubies) {
    c.pos = applyVec(G, c.pos)
    c.rot = mulMat(G, c.rot)
  }
  const word = ROT_WORDS.find((w) => {
    const m = frameMatrix(stateFromAlg(w))
    return !!m && m.every((v, i) => v === F[i])
  })
  return { state, rot: word ?? '' }
}

/** Gira el cubo entero hasta el marco canónico si las dos primeras capas están resueltas en algún marco. */
/**
 * Gira el cubo entero hasta el marco canónico si las dos primeras capas están resueltas en algún
 * marco. Mide SOLO contra los centros (`f2lSolvedRel`): en un 3x3 los centros son el marco, así
 * que una preparación escrita `x`/`y` es el mismo cubo agarrado de otra forma. No se pide que la
 * última capa quede «arriba» en coordenadas: en este modelo la última capa vive en casa con y = +1
 * y la cruz con y = -1, y una rotación del cubo entero nunca pone las piezas de la cruz y su casa
 * a la vez en la misma coordenada, así que ese filtro adicional hacían imposible la vista canónica.
 * LL_COLOR y el anillo de la lámina se detectan por la pieza que toca el centro amarillo, no por la
 * posición de la anilla (ver `CaseDiagram.llRing`), que era trivialmente verdadera para cualquier giro.
 */
export function canonicalizeState(base: CubeState): { state: CubeState; rot: string } {
  const { state, rot } = canonicalByFrame(base)
  if (rot && f2lSolvedRel(state)) return { state, rot }
  for (const word of ROT_WORDS) {
    const state2 = cloneState(base)
    applyMoves(state2, parseAlg(word))
    if (f2lSolvedRel(state2)) return { state: state2, rot: word }
  }
  return { state: base, rot: '' }
}


export interface StructureCheck {
  ok: boolean
  why: string
}

export function checkStructure(s0: CubeState, expect: string, sig?: Record<string, string | number>): StructureCheck {
  // Todo lo que compara contra el marco canónico (cruz abajo, última capa arriba) se mide
  // primero girando el cubo al marco que marcan los centros: una preparación `x`/`y` escrita
  // en el algoritmo no es un cubo desordenado, es el mismo cubo agarrado de otra forma.
  const s = canonicalizeState(s0).state
  const llPermutationSolved = LL_EDGES.every((p) => pieceAtHome(s, p)) && LL_CORNERS.every((p) => pieceAtHome(s, p))
  const allLlOriented = [...LL_EDGES, ...LL_CORNERS].every((p) => llEdgeOriented(s, p))
  switch (expect) {
    case 'oll': {
      if (isSolved(s)) return { ok: false, why: 'el estado plantado ya está resuelto' }
      if (!f2lSolved(s)) return { ok: false, why: 'el alg mueve piezas de las dos primeras capas' }
      if (!llPermutationSolved) return { ok: false, why: 'el alg permuta piezas de la última capa (no es un alg de OLL)' }
      const p = ollPattern(s)
      if (p.edges === 'cross' && p.unorientedCorners === 0) return { ok: false, why: 'nada que orientar' }
      return { ok: true, why: `aristas: ${EDGE_SHAPE_LABEL[p.edges]}, esquinas torcidas: ${p.unorientedCorners}` }
    }
    case 'pll': {
      if (isSolved(s)) return { ok: false, why: 'el estado plantado ya está resuelto' }
      if (!f2lSolved(s)) return { ok: false, why: 'el alg mueve piezas de las dos primeras capas' }
      if (!allLlOriented) return { ok: false, why: 'la última capa no queda orientada por el plantado' }
      const p = pllPattern(s)
      if (p.corners === 'id' && p.edges === 'id') return { ok: false, why: 'nada que permutar' }
      if (sig) {
        if (sig.corners && String(sig.corners) !== p.corners) return { ok: false, why: `esquinas: esperaba ${sig.corners}, es ${p.corners}` }
        if (sig.edges && String(sig.edges) !== p.edges) return { ok: false, why: `aristas: esperaba ${sig.edges}, es ${p.edges}` }
      }
      return { ok: true, why: `esquinas: ${PERM_LABEL[p.corners]} · aristas: ${PERM_LABEL[p.edges]}` }
    }
    case 'f2l-top': {
      if (isSolved(s)) return { ok: false, why: 'el estado plantado ya está resuelto' }
      if (!crossSolved(s)) return { ok: false, why: 'la cruz no queda resuelta en el plantado' }
      const p = f2lPattern(s)
      if (p.slot < 0) return { ok: false, why: 'no hay par blanco reconocible' }
      if (!p.cornerAt || p.cornerAt[1] !== 1) return { ok: false, why: 'la esquina blanca no está en la capa U' }
      if (!p.edgeAt || p.edgeAt[1] !== 1) return { ok: false, why: 'la arista blanca no está en la capa U' }
      return { ok: true, why: `hueco ${SLOT_LABEL[p.slot]}, hueco libre` }
    }
    case 'f2l-slot': {
      if (isSolved(s)) return { ok: false, why: 'el estado plantado ya está resuelto' }
      if (!crossSolved(s)) return { ok: false, why: 'la cruz no queda resuelta en el plantado' }
      const p = f2lPattern(s)
      if (p.slot < 0) return { ok: false, why: 'no hay par blanco reconocible' }
      const cornerInSlot = p.cornerAt && p.cornerAt[1] === 0
      const edgeInSlot = p.edgeAt && p.edgeAt[1] === 0
      if (!cornerInSlot && !edgeInSlot) return { ok: false, why: 'el par no está dentro del hueco' }
      return { ok: true, why: `par dentro del hueco ${SLOT_LABEL[p.slot]} (${p.slotState})` }
    }
    case 'cross': {
      if (isSolved(s)) return { ok: false, why: 'el estado plantado ya está resuelto' }
      const p = f2lPattern(s)
      if (p.slot < 0) return { ok: false, why: 'no hay arista blanca reconocible' }
      // en cross la arista objetivo está arriba y las otras tres cruzadas
      const whiteEdges = s.cubies.filter((c) => cubieIdentity(c).kind === 'edge' && cubieIdentity(c).colors.includes('D'))
      const target = whiteEdges.find((c) => c.pos[1] === 1)
      if (!target) return { ok: false, why: 'la arista objetivo no está en la capa U' }
      const others = CROSS_EDGES.filter((_, i) => i !== p.slot).filter((pos) => pieceAtHome(s, pos))
      if (others.length < 3) return { ok: false, why: 'faltan aristas de la cruz resueltas en el plantado' }
      return { ok: true, why: `arista arriba, hueco ${SLOT_LABEL[p.slot]}` }
    }
    default:
      return { ok: true, why: 'sin comprobación' }
  }
}

/** Caso plantado + patrón, para fichas y páginas de detalle. */
export interface CaseView {
  state: CubeState
  pattern: OllPattern | PllPattern | F2lPattern | null
}

export function buildCaseView(alg: string, expect: string): CaseView {
  const { state } = canonicalView(alg)
  let pattern: CaseView['pattern'] = null
  if (expect === 'oll') pattern = ollPattern(state)
  else if (expect === 'pll') pattern = pllPattern(state)
  else if (expect.startsWith('f2l') || expect === 'cross') pattern = f2lPattern(state)
  return { state, pattern }
}


/**
 * Vista canónica de un caso: la lámina y algunas librerías escriben los algs con
 * preparación (`x`, `y`), así que el plantado sale con la última capa mirando a otro lado.
 * `llView` busca la rotación del cubo entero que deja las dos primeras capas resueltas
 * con la última capa arriba y devuelve el algoritmo conjugado por esa rotación, que es
 * el algoritmo que hay que tocar en esa vista.
 */
/** @deprecated ver nota abajo: la normalización por rotación conjugada está mal definida para algs que ya llevan su preparación escrita. */
export function llViewLegacy(alg: string): { state: CubeState; alg: string; rot: string } {
  const base = caseState(alg)
  const turns = ['', 'x', 'x2', "x'", 'y', 'y2', "y'", 'z', 'z2', "z'"]
  for (const a of turns) {
    for (const b of turns) {
      const rot = [a, b].filter(Boolean).join(' ')
      const s = cloneState(base)
      applyMoves(s, parseAlg(rot))
      // el centro de la capa superior tiene que estar arriba (la última capa mirando a U)
      const upCenter = s.cubies.find((c) => key(c.home) === key([0, 1, 0]))
      if (upCenter && key(upCenter.pos) === key([0, 1, 0]) && f2lSolvedRel(s)) {
        const back = rot ? algToString(invertMoves(parseAlg(rot))) : ''
        return { state: s, alg: [rot, alg, back].filter(Boolean).join(' '), rot }
      }
    }
  }
  return { state: base, alg, rot: '' }
}


/* ------------------------------------------------------------------
 * Marco relativo a los centros. Una rotación del cubo entero (`x`, `y`, `z`)
 * mueve también los centros, y los centros son el marco: comparar una pieza
 * contra su casa canónica falla en cuanto hay preparación en el algoritmo.
 * `frameRotation` lee la rotación del marco mirando dónde están los centros y
 * `f2lSolvedRel` compara casas y orientaciones contra ese marco.
 * ------------------------------------------------------------------ */
const AXES: Pos[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
const ID3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]

/** Matriz 3x3 (fila mayor primero) del marco: posición mostrada = M · casa canónica. */
export function frameRotation(s: CubeState): number[] | null {
  const M = new Array(9).fill(0)
  const centers = s.cubies.filter((c) => c.pos.filter((v) => v !== 0).length === 1)
  if (centers.length < 6) return null
  // cada centro dice dónde se fue su eje canónico: M · casa = posición actual
  for (const c of centers) {
    const h = c.home
    for (let i = 0; i < 3; i++) {
      if (h[i] === 0) continue
      for (let j = 0; j < 3; j++) M[j * 3 + i] = h[i] * c.pos[j]
    }
  }
  // los seis centros tienen que ser una rotación válida (ejes distintos y ortogonales)
  const cols = [0, 1, 2].map((i) => [M[i], M[3 + i], M[6 + i]])
  const used = new Set(cols.map((c) => c.join(',')))
  if (used.size !== 3) return null
  const abs = (v: number[]) => Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2])
  if (cols.some((c) => abs(c) !== 1)) return null
  const det =
    M[0] * (M[4] * M[8] - M[5] * M[7]) - M[1] * (M[3] * M[8] - M[5] * M[6]) + M[2] * (M[3] * M[7] - M[4] * M[6])
  if (det !== 1) return null
  return M
}

export function byFrame(M: number[], p: Pos): Pos {
  const v = [0, 1, 2].map((i) => M[i * 3] * p[0] + M[i * 3 + 1] * p[1] + M[i * 3 + 2] * p[2])
  return [v[0], v[1], v[2]]
}

/** ¿Las dos primeras capas están resueltas en el marco que marca el cubo? */
/** La capa que en la vista actual está arriba (centro de esa casa en la posición [0,1,0]). */
export function topLayerIsU(s: CubeState): boolean {
  const up = s.cubies.find((c) => c.home.join(',') === '0,1,0')
  return !!up && up.pos.join(',') === '0,1,0'
}

export function f2lSolvedRel(s: CubeState): boolean {
  // El marco lo marcan los centros; el modelo guarda las matrices por columnas, así que para
  // las helpers fila-major de esta hoja hay que transponer la matriz del marco.
  const Fm = frameMatrix(s)
  if (!Fm) return false
  const M = transpose(Fm)
  const isTop = (p: Pos) => byFrame(M, p)[1] === 1
  for (const c of s.cubies) {
    const nz = c.pos.filter((v) => v !== 0).length
    if (nz === 1) continue // centros: definen el marco
    if (isTop(c.home)) continue // pieza de la última capa en la vista actual
    const want = byFrame(M, c.home)
    if (key(want) !== key(c.pos)) return false
    // Con el marco girado, la rotación de la pieza es su rotación nativa recableada por el marco:
    // la componente j de rot·F⁻¹ es Σ_k fila_j(rot)[k] · col_k(F).
    const col = [Fm[0], Fm[3], Fm[6]]
    for (let j = 0; j < 3; j++) {
      const row = c.rot[j * 3] * col[0] + c.rot[j * 3 + 1] * col[1] + c.rot[j * 3 + 2] * col[2]
      if (row !== c.home[j]) return false
    }
  }
  return true
}

/**
 * Vista canónica de un plantado: la lámina y algunas librerías escriben los algoritmos con
 * preparación escrita (`x`, `y`) y otros la llevan implícita, así que el plantado sale con la
 * última capa mirando a otro lado. `canonicalView` prueba las 24 rotaciones del cubo entero y
 * se queda con la que deja las dos primeras capas resueltas con la última capa arriba; devuelve
 * también lo que hay que tocar en esa vista (`alg` y detrás la rotación inversa). La
 * vista se auto-comprueba con `isSolved` (invariante al marco) y si la cuenta no cierra
 * devuelve el plantado crudo, que siempre cumple la regla del proyecto (plantado + algoritmo
 * = cubo resuelto).
 */
export function canonicalView(alg: string): { state: CubeState; play: string; rot: string } {
  const base = caseState(alg)
  // canonicalByFrame solo normaliza al marco de los centros (siempre devuelve rot=""), así que
  // nunca devolvía la rotación que pone la última capa arriba: las flechas de PLL se quedaban
  // sin esquinas. canonicalizeState sí busca el giro donde la cruz y las dos primeras capas
  // quedan resueltas y la última capa arriba. (canonicalByFrame se usa en checkStructure.)
  const { state, rot } = canonicalizeState(base)
  if (rot) {
    const back = algToString(invertMoves(parseAlg(rot)))
    const play = [alg, back].filter(Boolean).join(' ')
    const check = cloneState(state)
    applyMoves(check, parseAlg(play))
    if (isSolved(check)) return { state, play, rot }
  }
  return { state: base, play: alg, rot: '' }
}

export { cloneState, applyMoves, parseAlg, invertMoves, algToString, topGrid, frontGrid, cubieAt, isSolved, ID3 }
