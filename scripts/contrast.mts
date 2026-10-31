// Contraste de nuestras tablas contra la librería pública de Cubzor (fixtures/cubzor-*.json).
// No publica nada: solo informa. Sirve para detectar casos mal transcritos o numeraciones torcidas.
import { readFileSync } from 'node:fs'
import { applyMoves, caseState, isSolved, parseAlg } from '../src/cube/engine'
import { LL_CORNERS, LL_EDGES, llCornerOriented, llEdgeOriented, permOf, permKind } from '../src/cube/caseUtils'
import { OLL } from '../src/data/oll'
import { PLL } from '../src/data/pll'
import type { CaseDef } from '../src/data/types'
import type { CubeState } from '../src/cube/engine'

const FIX = (f: string) => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8')) as { alg: string; n?: number; code?: string }[]

const rot = <T, >(a: T[], k: number) => a.slice(k).concat(a.slice(0, k))

/** orientación de la última capa: 4 aristas + 4 esquinas, girable en U */
function orient(s: CubeState) {
  const e = LL_EDGES.map((p) => !llEdgeOriented(s, p))
  const c = LL_CORNERS.map((p) => !llCornerOriented(s, p))
  return { e, c }
}

function orientEq(a: ReturnType<typeof orient>, b: ReturnType<typeof orient>) {
  for (let k = 0; k < 4; k++) if (rot(a.e, k).join() === b.e.join() && rot(a.c, k).join() === b.c.join()) return true
  return false
}

function perm(s: CubeState) {
  return { c: permOf(s, LL_CORNERS), e: permOf(s, LL_EDGES) }
}

function permEq(a: ReturnType<typeof perm>, b: ReturnType<typeof perm>) {
  for (let co = 0; co < 4; co++) {
    if (rot(a.c, co).join() !== b.c.join()) continue
    for (let eo = 0; eo < 4; eo++) if (rot(a.e, eo).join() === b.e.join()) return true
  }
  return false
}

function report(kind: 'oll' | 'pll', theirs: ReturnType<typeof FIX>, mine: CaseDef[], same: (x: CubeState, y: CubeState) => boolean) {
  const bad: string[] = []
  const missing: string[] = []
  const renamed: string[] = []
  for (const t of theirs) {
    const id = kind === 'oll' ? `OLL ${t.n}` : `${t.code}`
    const st = caseState(t.alg)
    const test = caseState(t.alg) // applyMoves muta: se prueba en una copia para no resolver el plantado
    applyMoves(test, parseAlg(t.alg))
    if (!isSolved(test)) { bad.push(`${id}: su algoritmo no resuelve desde su plantado`); continue }
    const hit = mine.filter((m) => m.algs.some((a) => same(caseState(a), st)))
    if (hit.length) continue
    // ni un alg nuestro planta ese caso: buscamos en qué número de nuestra tabla aparece ese patrón
    const where = mine.filter((m) => m.algs.some((a) => same(caseState(a), st))).length
    void where
    const byPattern = mine.find((m) => same(caseState(m.algs[0]), st))
    if (byPattern) renamed.push(`${id} (Cubzor) == ${kind.toUpperCase()} ${byPattern.code} (nuestra tabla), y su alg no está en esa fila`)
    else missing.push(`${id} (${t.alg})`)
  }
  console.log(`\n[${kind.toUpperCase()}] contrastados ${theirs.length} · emparejados ${theirs.length - bad.length - missing.length - renamed.length}`)
  for (const b of bad) console.log('  MALO  ' + b)
  for (const r of renamed) console.log('  NUMERACIÓN DISTINTA  ' + r)
  for (const m of missing) console.log('  SIN COINCIDENCIA EN NUESTRA TABLA  ' + m)
}

const badAlgs = (kind: 'oll' | 'pll', list: CaseDef[]) => {
  const out: string[] = []
  for (const c of list) for (const a of c.algs) {
    const s = caseState(a)
    applyMoves(s, parseAlg(a))
    if (!isSolved(s)) out.push(`${kind} ${c.code}: ${a}`)
  }
  return out
}

report('oll', FIX('cubzor-oll.json'), OLL, (a, b) => orientEq(orient(a), orient(b)))
report('pll', FIX('cubzor-pll.json'), PLL, (a, b) => permEq(perm(a), perm(b)))

const mineBad = [...badAlgs('oll', OLL), ...badAlgs('pll', PLL)]
console.log(`\nnuestros algoritmos: ${OLL.length} casos OLL, ${PLL.length} casos PLL`)
if (mineBad.length) { console.log('  NO RESUELVEN:'); for (const b of mineBad) console.log('   ' + b) } else console.log('  todos resuelven desde su plantado')
console.log(`\npermutaciones declaradas: ${PLL.map((c) => `${c.code}=${permKind(permOf(caseState(c.algs[0]), LL_CORNERS))}/${permKind(permOf(caseState(c.algs[0]), LL_EDGES))}`).join(' ')}`)
