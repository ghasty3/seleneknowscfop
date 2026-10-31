import { caseState, cloneState, applyMoves, parseAlg, faceletHome, frameMatrix } from '../src/cube/engine.ts'
import { PLL } from '../src/data/pll.ts'
import { byFrame } from '../src/cube/caseUtils.ts'
const c = PLL.find(p=>p.code==='Ua')!
const s = caseState(c.algs[0]); applyMoves(s, parseAlg('x2'))
console.log('centros: U', faceletHome(s,'U',1,1), 'D', faceletHome(s,'D',1,1), 'F', faceletHome(s,'F',1,1), 'B', faceletHome(s,'B',1,1), 'L', faceletHome(s,'L',1,1), 'R', faceletHome(s,'R',1,1))
const F = frameMatrix(s)!
for (const cub of s.cubies) {
  const nz = cub.pos.filter(v=>v!==0).length
  if (nz === 1) continue
  const want = byFrame(F, cub.home as [number,number,number])
  const posOk = want.join(',')===cub.pos.join(',')
  const rot = cub.rot.join(',')
  console.log('home', cub.home.join(','), 'pos', cub.pos.join(','), 'want', want.join(','), posOk?'ok':'NO', 'rot', rot)
}
