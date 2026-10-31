import { solvedState, applyMoves, parseAlg, caseState, isSolved, cloneState, invertMoves } from '../src/cube/engine.ts'

const key = (p: number[]) => p.join(',')
const layerOf = (p: number[]) => (p[1] === 1 ? 'LL' : p[1] === 0 ? 'MID' : 'CROSS')

function outsideHome(alg: string) {
  const s = caseState(alg)
  const out = s.cubies.filter((c) => c.pos.join(',') !== c.home.join(','))
  const byLayer: Record<string, number> = {}
  for (const c of out) byLayer[layerOf(c.home)] = (byLayer[layerOf(c.home)] ?? 0) + 1
  return { total: out.length, byLayer, sample: out.slice(0, 8).map((c) => `${key(c.home)}->${key(c.pos)}`) }
}

for (const alg of ['R U R\' U\'', 'R U R\' U R U2 R\'', '(R U R\' U) (R U2 R\')', 'M U2 M\' U2 M\' U2 M', 'x', 'y', 'z', "R M' L'", 'F R U R\' U\' F\'', "R U2 R' U' R U R' U'"]) {
  const r = outsideHome(alg)
  console.log(alg.padEnd(28), 'fuera:', r.total, JSON.stringify(r.byLayer))
  if (r.total && r.total <= 12) console.log('   ', r.sample.join(' '))
}

// Sune debe dejar anillo+anillo medio en casa (es alg de última capa)
const s = solvedState()
applyMoves(s, parseAlg("R U R' U R U2 R'"))
console.log('Sune sobre resuelto: isSolved =', isSolved(s), '· anillo medio en casa =', s.cubies.filter((c) => c.home[1] === 0 && c.pos.join(',') === c.home.join(',')).length, 'de 8')
console.log('Sune permuta LL =', s.cubies.filter((c) => c.home[1] === 1 && c.pos.join(',') !== c.home.join(',')).length, 'piezas LL movidas')
// Sexy x6 = identidad
const t = solvedState()
applyMoves(t, parseAlg("R U R' U' R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'"))
console.log('sexy x6 = identidad:', isSolved(t))
