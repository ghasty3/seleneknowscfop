import { caseState } from '../src/cube/engine'
import { LL_CORNERS, LL_EDGES, llCornerOriented, llEdgeOriented } from '../src/cube/caseUtils'
import { OLL } from '../src/data/oll'

const sig = (alg: string) => {
  const s = caseState(alg)
  const e = LL_EDGES.map((p) => String(llEdgeOriented(s, p)))
  const c = LL_CORNERS.map((p) => String(llCornerOriented(s, p)))
  return `${alg.padEnd(34)} E[${e.join(',')}] C[${c.join(',')}]`
}
console.log('CUBZOR:')
console.log(sig('F R U R\' U\' F\''))
console.log(sig('r U R\' U R U2 r\''))
console.log('NOSOTROS (primeros 6 casos con ese alg base):')
for (const c of OLL.slice(0, 6)) console.log(sig(c.algs[0]))
console.log('nuestros códigos:', OLL.map((c) => c.code).join(' '))
console.log('contiene 45?', OLL.some((c) => c.code === '45'), 'contiene 7?', OLL.some((c) => c.code === '7'))
