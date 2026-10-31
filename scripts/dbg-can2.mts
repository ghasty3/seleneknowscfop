import { PLL } from '../src/data/pll.ts'
import { canonicalizeState, canonicalView, llOnTopView, f2lSolvedRel, upFrame } from '../src/cube/caseUtils.ts'
import { cloneState, applyMoves, parseAlg, isSolved, caseState, frameMatrix } from '../src/cube/engine.ts'
const c = PLL.find(p=>p.code==='Ua')!
const base = caseState(c.algs[0])
console.log('base   top', llOnTopView(base), 'f2l', f2lSolvedRel(base), 'yup', upFrame(base,'yellow'))
const s2 = cloneState(base); applyMoves(s2, parseAlg('x2'))
console.log('base+x2 top', llOnTopView(s2), 'f2l', f2lSolvedRel(s2), 'yup', upFrame(s2,'yellow'), 'F', frameMatrix(s2)?.join(','))
const cv = canonicalizeState(base)
console.log('canonicalizeState rot', JSON.stringify(cv.rot))
const t = cloneState(cv.state); applyMoves(t, parseAlg(c.algs[0]))
console.log('tras el alg, isSolved:', isSolved(t), 'F tras alg:', frameMatrix(t)?.join(','))
