import { PLL } from '../src/data/pll.ts'
import { upFrame, canonicalizeState, byFrame } from '../src/cube/caseUtils.ts'
import { caseState, cloneState, applyMoves, parseAlg, frameMatrix, transpose, cubieIdentity } from '../src/cube/engine.ts'
const c = PLL.find(p=>p.code==='Ua')!
const base = caseState(c.algs[0])
const A = cloneState(base); applyMoves(A, parseAlg('x2'))
const B = cloneState(base); applyMoves(B, parseAlg('x2'))
console.log('identical states:', JSON.stringify(A)===JSON.stringify(B))
console.log('F(A)', frameMatrix(A)?.join(','), 'F(B)', frameMatrix(B)?.join(','))
console.log('upFrame(A) yellow', upFrame(A,'yellow'), 'upFrame(B) yellow', upFrame(B,'yellow'))
// comprobar centro por centro: casa -> posición
for (const cub of A.cubies) {
  if ([0,1,2].filter(v=>cub.home[v]!==0).length!==1) continue
  console.log('centro casa', cub.home.join(','), 'pos', cub.pos.join(','), cubieIdentity(cub).colors.join(''))
}
