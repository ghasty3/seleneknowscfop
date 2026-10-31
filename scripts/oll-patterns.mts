// Diagnóstico de la tabla OLL: cuántos patrones de última capa distintos hay,
// cuáles se repiten y cuáles no aparecen en la librería de Cubzor.
import { readFileSync } from 'node:fs'
import { caseState } from '../src/cube/engine'
import { LL_CORNERS, LL_EDGES, llCornerOriented, llEdgeOriented } from '../src/cube/caseUtils'
import { OLL } from '../src/data/oll'

const FIX = JSON.parse(readFileSync(new URL('./fixtures/cubzor-oll.json', import.meta.url), 'utf8')) as { n: number; alg: string }[]

// patrón de orientación de la última capa, canónico bajo rotaciones U
const canon = (alg: string) => {
  const s = caseState(alg)
  const e = LL_EDGES.map((p) => (llEdgeOriented(s, p) ? '1' : '0'))
  const c = LL_CORNERS.map((p) => (llCornerOriented(s, p) ? '1' : '0'))
  const rots = Array.from({ length: 4 }, (_, k) => [...e.slice(k), ...e.slice(0, k)].join() + '|' + [...c.slice(k), ...c.slice(0, k)].join())
  return rots.sort()[0]
}

const mine = new Map<string, string[]>()
for (const c of OLL) {
  const k = canon(c.algs[0])
  mine.set(k, [...(mine.get(k) ?? []), c.code])
}
const theirs = new Map<string, number>()
for (const t of FIX) theirs.set(canon(t.alg), t.n)

const dup = [...mine].filter(([, codes]) => codes.length > 1)
console.log(`casos nuestros: ${OLL.length} · patrones distintos: ${mine.size}`)
console.log(`patrones repetidos: ${dup.length}`)
for (const [k, codes] of dup) console.log(`  ${codes.join(' = ')}  ${k}`)
const extra = [...mine].filter(([k]) => !theirs.has(k))
console.log(`patrones nuestros que no están en Cubzor (${extra.length}):`)
for (const [k, codes] of extra) console.log(`  OLL ${codes.join('/')}  ${k}`)
const gap = [...theirs].filter(([k]) => !mine.has(k))
console.log(`patrones de Cubzor que faltan en nuestra tabla (${gap.length}):`)
for (const [k, n] of gap) console.log(`  OLL ${n}  ${k}`)
// sin smoke
