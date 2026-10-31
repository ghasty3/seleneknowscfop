// Diagnóstico de la tabla PLL: permutación de la última capa de cada caso,
// canónica bajo rotaciones de toda la esfera, contrastada con Cubzor.
import { readFileSync } from 'node:fs'
import { applyMoves, caseState, parseAlg } from '../src/cube/engine'
import { LL_CORNERS, LL_EDGES, permOf } from '../src/cube/caseUtils'
import { PLL } from '../src/data/pll'

const FIX = JSON.parse(readFileSync(new URL('./fixtures/cubzor-pll.json', import.meta.url), 'utf8')) as { code: string; alg: string }[]

/** firma de permutación de la última capa, invariante ante rotaciones del cubo entero */
function sig(alg: string): string {
  const base = caseState(alg)
  const keys: string[] = []
  for (const ax of ['x', 'y', 'z'] as const) {
    for (let t = 0; t < 4; t++) {
      const s = { cubies: base.cubies.map((c) => ({ ...c, pos: [...c.pos] as [number, number, number], rot: [...c.rot] as [number, number, number] })) }
      applyMoves(s, parseAlg(Array(t).fill(ax).join(' ')))
      const c = permOf(s, LL_CORNERS).map((i) => String(i)).join()
      const e = permOf(s, LL_EDGES).map((i) => String(i)).join()
      keys.push(`${c}|${e}`)
    }
  }
  return keys.sort()[0]
}

const mine = new Map<string, string[]>()
for (const c of PLL) mine.set(sig(c.algs[0]), [...(mine.get(sig(c.algs[0])) ?? []), c.code])
const theirs = new Map<string, string>()
for (const t of FIX) theirs.set(sig(t.alg), t.code)

console.log(`casos nuestros: ${PLL.length} · permutaciones distintas: ${mine.size}`)
for (const [k, codes] of [...mine].filter(([, v]) => v.length > 1)) console.log(`  REPETIDA ${codes.join(" = ")}  ${k.slice(0, 20)}`)
console.log(`faltan en nuestra tabla (${[...theirs].filter(([k]) => !mine.has(k)).length}): ${[...theirs].filter(([k]) => !mine.has(k)).map(([k, c]) => `${c} ${k.slice(0, 17)}`).join(' · ')}`)
console.log(`sobran en nuestra tabla (${[...mine].filter(([k]) => !theirs.has(k)).length}): ${[...mine].filter(([k]) => !theirs.has(k)).map(([k, c]) => `${c.join('/')}`).join(' · ')}`)
