import { PLL } from '../src/data/pll.ts'
import { upFrame, byFrame } from '../src/cube/caseUtils.ts'
import { caseState, applyMoves, parseAlg, frameMatrix, faceletHome, cubieIdentity, mulMat, transpose } from '../src/cube/engine.ts'
const isIdentityRot = (r: number[]) => r.join(',') === '1,0,0,0,1,0,0,0,1'
const c = PLL.find(p=>p.code==='Ua')!
const s = caseState(c.algs[0]); applyMoves(s, parseAlg('x2'))
const F = frameMatrix(s)!
console.log('F', F.join(','), 'homeTop', byFrame(transpose(F), [0,1,0]).join(','), 'U center', faceletHome(s,'U',1,1))
for (const cub of s.cubies) {
  const nz = [0,1,2].filter(i=>cub.home[i]!==0).length
  if (nz===1 || nz===3) continue
  if (cub.home[1]!==0) continue
  const want = byFrame(F, cub.home as [number,number,number])
  console.log(cubieIdentity(cub).kind, cub.home.join(','), cub.pos.join(','), want.join(','), want.join(',')===cub.pos.join(','), 'rotId', isIdentityRot(mulMat(transpose(F), cub.rot)))
}
const s1 = caseState(c.algs[0]); console.log('base yellow', upFrame(s1,'yellow'), 'white', upFrame(s1,'white')); console.log('base+x2 yellow', upFrame(s,'yellow'), 'white', upFrame(s,'white'))
