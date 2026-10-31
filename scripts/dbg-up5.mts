import { PLL } from '../src/data/pll.ts'
import { byFrame } from '../src/cube/caseUtils.ts'
import { caseState, applyMoves, parseAlg, frameMatrix, transpose, mulMat, applyVec } from '../src/cube/engine.ts'
const c = PLL.find(p=>p.code==='Ua')!
const s = caseState(c.algs[0]); applyMoves(s, parseAlg('x2'))
const F = frameMatrix(s)!
const Fi = transpose(F)
const homeTop = byFrame(Fi,[0,1,0]).join(',')
console.log('1) homeTop', homeTop, 'passes', homeTop === '0,-1,0')
let ok = true
for (const cub of s.cubies) {
  const nz = cub.home.filter(v=>v!==0).length
  if (nz===1 || nz===3 || cub.home[1]!==0) continue
  const posOk = applyVec(F, cub.home).join(',')===cub.pos.join(',')
  const rotOk = mulMat(F, cub.rot).join(',')==='1,0,0,0,1,0,0,0,1'
  if (!posOk || !rotOk) { ok = false; console.log('2) fallo pieza casa', cub.home.join(','), 'pos', cub.pos.join(','), 'esperada', applyVec(F, cub.home).join(','), 'rotOk', rotOk) }
}
console.log('2) anilla', ok)
