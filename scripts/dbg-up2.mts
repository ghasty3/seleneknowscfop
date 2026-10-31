import { PLL } from '../src/data/pll.ts'
import { upFrame, byFrame } from '../src/cube/caseUtils.ts'
import { caseState, applyMoves, parseAlg, frameMatrix, mulMat, transpose, applyVec } from '../src/cube/engine.ts'
const c = PLL.find(p=>p.code==='Ua')!
const s = caseState(c.algs[0]); applyMoves(s, parseAlg('x2'))
const F = frameMatrix(s)!
console.log('mode yellow ->', upFrame(s,'yellow'), ' | white ->', upFrame(s,'white'))
for (const cub of s.cubies) {
  const nz = [0,1,2].filter(i=>cub.home[i]!==0).length
  if (nz===1 || nz===3 || cub.home[1]!==0) continue
  const pos = applyVec(F, cub.home).join(',')===cub.pos.join(',')
  const rotIdT = mulMat(transpose(F), cub.rot).join(',')==='1,0,0,0,1,0,0,0,1'
  const rotIdF = mulMat(F, cub.rot).join(',')==='1,0,0,0,1,0,0,0,1'
  console.log(cub.home.join(','), 'pos', pos, 'rotF', rotIdF, 'rotT', rotIdT)
}
const Fi = transpose(F)
console.log('byFrame(Fi,[0,1,0]) =', byFrame(Fi,[0,1,0]).join(','), 'byFrame(F,[0,1,0]) =', byFrame(F,[0,1,0]).join(','))
import { canonicalizeState } from '../src/cube/caseUtils.ts'
console.log('canonicalizeState:', JSON.stringify(canonicalizeState(caseState(c.algs[0])).rot))
import { cloneState } from '../src/cube/engine.ts'
const base = caseState(c.algs[0])
for (const w of ['', 'x2', 'x', "x'"]) {
  const st = cloneState(base); if (w) applyMoves(st, parseAlg(w))
  console.log('word', JSON.stringify(w), 'yellow', upFrame(st,'yellow'), 'white', upFrame(st,'white'))
}
