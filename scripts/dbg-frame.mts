import { frameMatrix, isSolved, parseAlg, solvedState, applyMoves, cloneState } from '../src/cube/engine'
import { canonicalByFrame, f2lSolvedRel } from '../src/cube/caseUtils'
import { caseState } from '../src/cube/engine'

const alg = "x R U2 R' U' R U' R'"
const base = caseState(alg)
console.log('frame', frameMatrix(base))
console.log('f2lSolvedRel base', f2lSolvedRel(base))
const { state, rot } = canonicalByFrame(base)
console.log('canon rot', JSON.stringify(rot), 'frame canon', frameMatrix(state))
console.log('f2lSolvedRel canon', f2lSolvedRel(state))
const play = [alg, "x'"].join(' ')
const after = cloneState(state)
applyMoves(after, parseAlg(play))
console.log('after play isSolved', isSolved(after))
const s2 = cloneState(base)
applyMoves(s2, parseAlg('x'))
console.log('isSolved(base + alg + x\') =', (() => { const t = cloneState(s2); applyMoves(t, parseAlg(alg)); return isSolved(t) })())
