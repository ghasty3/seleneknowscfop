// Motor 3x3 sin dependencias. Modelo de cubies: posición (-1|0|1)^3 + matriz de orientación.
// Ejes: x = derecha (R), y = arriba (U), z = frente (F). Giro horario de una cara = -90° sobre su eje.

export type Axis = 'x' | 'y' | 'z'
export type Layers = number[] // capas afectadas, p.ej. [1] para R, [1,0] para r, [-1,0,1] para rotación cubo completo

export interface Move {
  id: string // notación original: "R", "R'", "M2"
  axis: Axis
  layers: Layers
  dir: 1 | -1 // -1 = -90° (horario visto desde esa cara)
  half?: boolean // true si es el segundo cuarto de un "R2" (para pintar la notación)
  secondOf?: string // notación del "R2" del que forma parte
  rot?: 'x' | 'y' | 'z' // rotación de cubo completo (no cambia el estado relativo)
}

type Mat = number[] // 9 elementos, fila mayor
export type { Mat }

const I: Mat = [1, 0, 0, 0, 1, 0, 0, 0, 1]

export const IDENTITY_MAT: Mat = I

function mat(axis: Axis, dir: 1 | -1): Mat {
  const s = dir === -1 ? -1 : 1 // ángulo = s * 90°
  if (axis === 'x') return [1, 0, 0, 0, 0, s, 0, -s, 0]
  if (axis === 'y') return [0, 0, -s, 0, 1, 0, s, 0, 0]
  return [0, s, 0, -s, 0, 0, 0, 0, 1]
}

function mul(a: Mat, b: Mat): Mat {
  const r = new Array(9).fill(0)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]
  return r
}

function apply3(m: Mat, v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ]
}

export interface Cubie {
  home: [number, number, number]
  pos: [number, number, number]
  rot: Mat
}

export interface CubeState {
  cubies: Cubie[] // 26, sin núcleo
}

const HOME_KEYS: [number, number, number][] = []
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x || y || z) HOME_KEYS.push([x, y, z])

export function solvedState(): CubeState {
  return { cubies: HOME_KEYS.map((h) => ({ home: [...h] as [number, number, number], pos: [...h] as [number, number, number], rot: [...I] })) }
}

export function cloneState(s: CubeState): CubeState {
  return { cubies: s.cubies.map((c) => ({ home: [...c.home] as [number, number, number], pos: [...c.pos] as [number, number, number], rot: [...c.rot] })) }
}

export function applyVec(m: Mat, v: [number, number, number]): [number, number, number] {
  return apply3(m, v)
}

export const mulMat = mul

export function applyMove(s: CubeState, m: Move): void {
  const M = mat(m.axis, m.dir)
  for (const c of s.cubies) {
    const idx = m.axis === 'x' ? 0 : m.axis === 'y' ? 1 : 2
    if (!m.layers.includes(c.pos[idx])) continue
    c.pos = apply3(M, c.pos)
    c.rot = mul(M, c.rot)
  }
}

export function applyMoves(s: CubeState, moves: Move[]): void {
  for (const m of moves) applyMove(s, m)
}

/**
 * Matriz del marco: qué rotación del cubo entero llevan los centros. Los centros son el
 * marco de referencia de un cubo 3x3 normal (no están marcados), así que girar el cubo
 * entero (`x`, `y`, `z`) NO desordena el cubo: hay que leerlo contra los centros.
 */
export function frameMatrix(s: CubeState): Mat | null {
  const centers = s.cubies.filter((c) => c.pos.filter((v) => v !== 0).length === 1)
  if (centers.length < 6) return null
  const M = new Array(9).fill(0)
  for (const c of centers) {
    const h = c.home
    for (let i = 0; i < 3; i++) {
      if (h[i] === 0) continue
      for (let j = 0; j < 3; j++) M[j * 3 + i] = h[i] * c.pos[j]
    }
  }
  const cols = [0, 1, 2].map((i) => [M[i], M[3 + i], M[6 + i]])
  if (new Set(cols.map((c) => c.join(','))).size !== 3) return null
  if (cols.some((c) => Math.abs(c[0]) + Math.abs(c[1]) + Math.abs(c[2]) !== 1)) return null
  const det =
    M[0] * (M[4] * M[8] - M[5] * M[7]) - M[1] * (M[3] * M[8] - M[5] * M[6]) + M[2] * (M[3] * M[7] - M[4] * M[6])
  return det === 1 ? M : null
}

/** Transpuesta = inversa para matrices de rotación. */
export function transpose(m: Mat): Mat {
  return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]
}

/**
 * Cubo resuelto: cada pieza en su casa y sin giros, medido CONTRA EL MARCO que marcan los
 * centros. Una rotación del cubo entero es sólo un cambio de forma de agarrarlo: seguida de
 * su inversa vuelve a la identidad, y un cubo resuelto agarrado girado sigue siendo resuelto.
 */
export function isSolved(s: CubeState): boolean {
  // «Resuelto» se mide contra los centros, que son el marco físico del cubo: si el cubo está
  // resuelto pero agarrado con una rotación de cubo completo (`x`, `y`, `z`), los centros giran
  // con él y cada pieza debe llevar la MISMA rotación global que llevan los centros. Comparar
  // contra la identidad a secas hacía que un cubo resuelto con preparación escrita (`x R U2 R'…`)
  // nunca se marcara como resuelto — ese era el fallo de lógica del cubo que se veía en el
  // reproduccor: el paso final se marcaba pero el cubo seguía desordenado.
  const F = frameMatrix(s) ?? I
  return s.cubies.every((c) => {
    // El modelo guarda las matrices por COLUMNAS y `apply3` aplica la transpuesta, así que
    // apply3(transpose(F), pos) = F·pos en espacio de posiciones.
    const p = apply3(transpose(F), c.pos)
    if (p[0] !== c.home[0] || p[1] !== c.home[1] || p[2] !== c.home[2]) return false
    // Con el marco girado F la rotación de cada pieza es su rotación nativa recableada por el
    // marco: rot = M_home·F⁻¹. Con matrices fila-major, col_j(rot) = [rot[j], rot[3+j], rot[6+j]]
    // y debe valer col_j(rot) = col_j(F) · home[j] (los home son ejes con signo).
    for (let j = 0; j < 3; j++) {
      const h = c.home[j]
      const col = [c.rot[j], c.rot[3 + j], c.rot[6 + j]]
      const want = [h * F[0], h * F[1], h * F[2]]
      if (col[0] !== want[0] || col[1] !== want[1] || col[2] !== want[2]) return false
    }
    return true
  })
}

// ---------- Notación ----------

interface Spec {
  axis: Axis
  layers: number[]
  dir: 1 | -1
  cubeRot?: 'x' | 'y' | 'z'
}

const ALL = [-1, 0, 1]

export const MOVE_SPECS: Record<string, Spec> = {
  R: { axis: 'x', layers: [1], dir: -1 },
  r: { axis: 'x', layers: [1, 0], dir: -1 },
  L: { axis: 'x', layers: [-1], dir: 1 },
  l: { axis: 'x', layers: [-1, 0], dir: 1 },
  M: { axis: 'x', layers: [0], dir: 1 },
  U: { axis: 'y', layers: [1], dir: -1 },
  u: { axis: 'y', layers: [1, 0], dir: -1 },
  D: { axis: 'y', layers: [-1], dir: 1 },
  d: { axis: 'y', layers: [-1, 0], dir: 1 },
  E: { axis: 'y', layers: [0], dir: 1 },
  F: { axis: 'z', layers: [1], dir: -1 },
  f: { axis: 'z', layers: [1, 0], dir: -1 },
  B: { axis: 'z', layers: [-1], dir: 1 },
  b: { axis: 'z', layers: [-1, 0], dir: 1 },
  S: { axis: 'z', layers: [0], dir: -1 },
  x: { axis: 'x', layers: ALL, dir: -1, cubeRot: 'x' },
  y: { axis: 'y', layers: ALL, dir: -1, cubeRot: 'y' },
  z: { axis: 'z', layers: ALL, dir: -1, cubeRot: 'z' },
}

/** Convierte notación en secuencia de movimientos de cuarto de vuelta (R2 => R R). */
export function parseAlg(alg: string): Move[] {
  const clean = alg.replace(/[()]/g, ' ').replace(/\/\s*/g, ' ').replace(/\s+/g, ' ').trim()
  const tokens = clean.split(' ').filter(Boolean)
  const moves: Move[] = []
  for (const tok of tokens) {
    const base = tok[0]
    const spec = MOVE_SPECS[base]
    if (!spec) throw new Error(`Movimiento no soportado: "${tok}"`)
    let rest = tok.slice(1)
    let dir = spec.dir
    // orden flexible: R'2 / R2' / R' '
    let prime = 0
    let half = false
    while (rest.length) {
      const ch = rest[0]
      if (ch === "'" || ch === '-') {
        prime++
        rest = rest.slice(1)
      } else if (ch === '2') {
        half = true
        rest = rest.slice(1)
      } else break
    }
    if (rest.length) throw new Error(`Movimiento no soportado: "${tok}"`)
    if (prime % 2) dir = dir === 1 ? -1 : 1
    const turns = half ? 2 : 1
    for (let i = 0; i < turns; i++) {
      moves.push({
        id: turns === 2 ? tok : i === 0 ? tok : '',
        axis: spec.axis,
        layers: spec.layers,
        dir: i === 0 ? dir : (dir === 1 ? -1 : 1),
        half: turns === 2 && i === 1,
        secondOf: turns === 2 && i === 1 ? tok : undefined,
        rot: spec.cubeRot,
      })
    }
  }
  return moves
}

export function invertMoves(moves: Move[]): Move[] {
  const inv = [...moves]
    .reverse()
    .map((m) => ({ ...m, id: '', dir: (m.dir === 1 ? -1 : 1) as 1 | -1, half: false, secondOf: undefined }))
  const ids = algToString(inv).split(' ')
  inv.forEach((m, i) => {
    m.id = ids[i] || m.id
  })
  return inv
}

/**
 * Espejo del algoritmo (plano vertical izquierda-derecha): R ↔ L’, U → U’,
 * M → M’. Las rotaciones de cubo completo invierten su sentido.
 */
export function mirrorMoves(moves: Move[]): Move[] {
  return moves.map((m) => ({
    ...m,
    layers: m.axis === 'x' ? m.layers.map((l) => -l) : m.layers,
    dir: (m.dir === 1 ? -1 : 1) as 1 | -1,
    half: false,
    secondOf: undefined,
    id: '',
  }))
}

export function mirrorAlg(alg: string): string {
  const m = mirrorMoves(parseAlg(alg))
  const ids = algToString(m).split(' ')
  m.forEach((mv, i) => {
    mv.id = ids[i] || mv.id
  })
  return ids.join(' ')
}

export function algToString(moves: Move[]): string {
  const out: string[] = []
  for (const m of moves) {
    if (m.half && out.length) {
      out[out.length - 1] += '2'
      continue
    }
    const canon = CANON.get(`${m.axis}:${m.layers.join(',')}`)
    if (!canon) {
      out.push(m.axis)
      continue
    }
    out.push(canon.letter + (m.dir === canon.dir ? '' : "'"))
  }
  return out.join(' ')
}

const CANON = new Map<string, { letter: string; dir: 1 | -1 }>()
for (const [k, s] of Object.entries(MOVE_SPECS)) {
  CANON.set(`${s.axis}:${s.layers.join(',')}`, { letter: k, dir: s.dir })
}

export function stateFromAlg(alg: string, base = solvedState()): CubeState {
  applyMoves(base, parseAlg(alg))
  return base
}

/** Estado inicial del caso: el estado desde el cual el algoritmo resuelve el cubo. */
export function caseState(alg: string): CubeState {
  const s = solvedState()
  applyMoves(s, invertMoves(parseAlg(alg)))
  return s
}

// ---------- Cara / stickers para diagramas ----------

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'

const FACE_DIR: Record<Face, [number, number, number]> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
}

const LOCAL_AXES: [number, number, number][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

/** Sticker (color de cara resuelta) visible en la cara `face` del cubo en la posición dada. */
export function faceletHome(s: CubeState, face: Face, row: number, col: number): string {
  const d = FACE_DIR[face]
  const [x, y, z] = gridToPos(face, row, col)
  const c = s.cubies.find((c) => c.pos[0] === x && c.pos[1] === y && c.pos[2] === z)
  if (!c) return ''
  for (let i = 0; i < 6; i++) {
    const n = LOCAL_AXES[i]
    const w = apply3(c.rot, n)
    if (w[0] === d[0] && w[1] === d[1] && w[2] === d[2]) {
      const home = HOME_AXIS(i)
      return home[0] === 1 ? 'R' : home[0] === -1 ? 'L' : home[1] === 1 ? 'U' : home[1] === -1 ? 'D' : home[2] === 1 ? 'F' : 'B'
    }
  }
  return ''
}

function HOME_AXIS(i: number): [number, number, number] {
  return LOCAL_AXES[i]
}

/** (row, col) en la vista estándar de cada cara -> posición 3D. row 0 = arriba de la vista. */
export function gridToPos(face: Face, row: number, col: number): [number, number, number] {
  const r = row - 1
  const c = col - 1
  switch (face) {
    case 'U':
      return [c, 1, -r]
    case 'D':
      return [c, -1, r]
    case 'F':
      return [c, -r, 1]
    case 'B':
      return [-c, -r, -1]
    case 'R':
      return [1, -r, c]
    case 'L':
      return [-1, -r, -c]
  }
}

export function topGrid(s: CubeState): string[][] {
  const g: string[][] = []
  for (let r = 0; r < 3; r++) {
    const row: string[] = []
    for (let c = 0; c < 3; c++) row.push(faceletHome(s, 'U', r, c))
    g.push(row)
  }
  return g
}

export function frontGrid(s: CubeState): string[][] {
  const g: string[][] = []
  for (let r = 0; r < 3; r++) {
    const row: string[] = []
    for (let c = 0; c < 3; c++) row.push(faceletHome(s, 'F', r, c))
    g.push(row)
  }
  return g
}

// ---------- Scramble ----------

const SCRAMBLE_POOL = ['R', "R'", 'U', "U'", 'L', "L'", 'F', "F'", 'B', "B'"]

export function scramble(len = 22, seed = Math.random()): string {
  const rng = mulberry(seed)
  const out: string[] = []
  let last = ''
  let last2 = ''
  while (out.length < len) {
    const m = SCRAMBLE_POOL[Math.floor(rng() * SCRAMBLE_POOL.length)]
    const face = m[0]
    if (face === last || face === last2) continue
    out.push(rng() > 0.7 ? m + '2' : m)
    last2 = last
    last = face
  }
  return out.join(' ')
}

function mulberry(seed: number) {
  let a = Math.floor(seed * 1e9) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- Utilidades de estado ----------

export function indexAt(pos: [number, number, number]): number {
  return HOME_KEYS.findIndex((h) => h[0] === pos[0] && h[1] === pos[1] && h[2] === pos[2])
}

/** Identidad de un cubie: qué caras "de casa" tiene (para emparejar piezas). */
export function cubieIdentity(c: Cubie): { kind: 'corner' | 'edge' | 'center'; colors: string[] } {
  const n = Math.abs(c.home[0]) + Math.abs(c.home[1]) + Math.abs(c.home[2])
  const colors: string[] = []
  if (c.home[0] === 1) colors.push('R')
  if (c.home[0] === -1) colors.push('L')
  if (c.home[1] === 1) colors.push('U')
  if (c.home[1] === -1) colors.push('D')
  if (c.home[2] === 1) colors.push('F')
  if (c.home[2] === -1) colors.push('B')
  return { kind: n === 3 ? 'corner' : n === 2 ? 'edge' : 'center', colors }
}
