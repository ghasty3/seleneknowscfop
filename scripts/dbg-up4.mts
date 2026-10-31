import { PLL } from '../src/data/pll.ts'
import { upFrame, byFrame } from '../src/cube/caseUtils.ts'
import { caseState, cloneState, applyMoves, parseAlg, frameMatrix, transpose } from '../src/cube/engine.ts'
const c = PLL.find(p=>p.code==='Ua')!
const s = caseState(c.algs[0]); applyMoves(s, parseAlg('x2'))
const A = cloneState(s)
console.log('upFrame(s) yellow', upFrame(s,'yellow'), 'upFrame(A) yellow', upFrame(A,'yellow'))
console.log('F === F(clone)?', frameMatrix(s)!.join(','), frameMatrix(A)!.join(','))
console.log('homeTop s', byFrame(transpose(frameMatrix(s)!),[0,1,0]).join(','))
console.log('homeTop A', byFrame(transpose(frameMatrix(A)!),[0,1,0]).join(','))
