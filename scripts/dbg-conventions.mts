// Prueba de convenciones: el modelo guarda `rot` como matriz; se postulan dos reglas de
// actualización y se comprueba cuál hace que TODO cierre:
//  (a) un cubo resuelto girado entero (`x`) sigue siendo resuelto,
//  (b) la inversa de un escramble devuelve el cubo resuelto,
//  (c) ninguna pegatina visible se queda sin color tras cualquier secuencia.
import { solvedState, parseAlg, cloneState, faceletHome, invertMoves } from '../src/cube/engine'
import type { CubeState, Move, Mat } from '../src/cube/engine'
const a3 = (m: Mat, v: [number, number, number]): [number, number, number] => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
]

const T = (m: Mat): Mat => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]
// el motor no exporta `mat`, así que aquí se replican las rotaciones elementales
const mat = (axis: 'x' | 'y' | 'z', dir: 1 | -1): Mat =>
  ({
    x: [1, 0, 0, 0, 0, -dir, 0, dir, 0],
    y: [0, 0, dir, 0, 1, 0, -dir, 0, 0],
    z: [0, -dir, 0, dir, 0, 0, 0, 0, 1],
  })[axis]
const mm = (a: Mat, b: Mat): Mat => {
  const r = new Array(9).fill(0)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]
  return r
}

function applyRule(s: CubeState, m: Move, rule: 'Mrot' | 'Mtrot'): void {
  const M = mat(m.axis, m.dir)
  const MT = T(M)
  const A = rule === 'Mrot' ? M : MT
  for (const c of s.cubies) {
    const idx = m.axis === 'x' ? 0 : m.axis === 'y' ? 1 : 2
    if (!m.layers.includes(c.pos[idx])) continue
    c.pos = a3(M, c.pos)
    // rot' = A · rot, con matrices fila-major: fila_i(rot') = A · fila_i(rot)
    for (let i = 0; i < 3; i++) c.rot[i * 3 + 0] = A[0] * c.rot[i * 3] + A[1] * c.rot[i * 3 + 1] + A[2] * c.rot[i * 3 + 2]
    for (let i = 0; i < 3; i++) c.rot[i * 3 + 1] = A[3] * c.rot[i * 3] + A[4] * c.rot[i * 3 + 1] + A[5] * c.rot[i * 3 + 2]
    for (let i = 0; i < 3; i++) c.rot[i * 3 + 2] = A[6] * c.rot[i * 3] + A[7] * c.rot[i * 3 + 1] + A[8] * c.rot[i * 3 + 2]
  }
}

function isSolvedRel(s: CubeState): boolean {
  // resuelto contra los centros: cada pieza debe estar en su casa y con la rotación del marco
  const F = (() => {
    const centers = s.cubies.filter((c) => c.pos.filter((v) => v !== 0).length === 1)
    const M = new Array(9).fill(0)
    for (const c of centers) for (let i = 0; i < 3; i++) { if (c.home[i] === 0) continue; for (let j = 0; j < 3; j++) M[j * 3 + i] = c.home[i] * c.pos[j] }
    return M as Mat
  })()
  for (const c of s.cubies) {
    if (c.pos.filter((v) => v !== 0).length === 1) continue
    const p = a3(T(T(F)), c.pos) // F·pos
    if (p[0] !== c.home[0] || p[1] !== c.home[1] || p[2] !== c.home[2]) return false
    for (let j = 0; j < 3; j++) {
      const col = [c.rot[j], c.rot[3 + j], c.rot[6 + j]]
      const want = [c.home[j] * F[0], c.home[j] * F[1], c.home[j] * F[2]]
      if (col[0] !== want[0] || col[1] !== want[1] || col[2] !== want[2]) return false
    }
  }
  return true
}

function emptyStickers(s: CubeState): number {
  let n = 0
  for (const f of ['U', 'D', 'F', 'B', 'R', 'L'] as const)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      if (faceletHome(s, f, r + 1, c + 1) === '') n++
    }
  return n
}

for (const rule of ['Mrot', 'Mtrot'] as const) {
  const seqs = ['x', 'x R U2 R\' U\' R U\' R\'', 'R U R\' U\' R\' F R2 U\' R\' U\'', 'y R U R\' U\' R\' F R2 U\' R\' U\'', "R U R' U' M2 U R U' R' F'"]
  let okSolved = 0, okEmpty = 0
  for (const q of seqs) {
    const mv = parseAlg(q)
    const s1 = solvedState()
    for (const m of mv) applyRule(s1, m, rule)
    const solvedByAlg = q.endsWith("R'") || q.endsWith('U') || q === 'x'
    if (isSolvedRel(s1)) okSolved++
    void solvedByAlg
  }
  // inversa de un escramble
  const scr = parseAlg("R U2 F' L D' R2 U B' F L2 U' R' D B2 U2 F' R D2 L'")
  const s2 = solvedState()
  for (const m of scr) applyRule(s2, m, rule)
  const s3 = cloneState(s2)
  for (const m of invertMoves(scr)) applyRule(s3, m, rule)
  console.log(
    rule,
    'secoencias cerradas(comprueba manual abajo):', okSolved,
    'inversa-cierra:', isSolvedRel(s3),
    'pegatinas vacías tras escramble:', emptyStickers(s2),
  )
}
