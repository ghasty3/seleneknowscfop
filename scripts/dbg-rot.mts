import { solvedState, applyMoves, parseAlg, isSolved, frameMatrix, cloneState, faceletHome } from '../src/cube/engine'

const s = solvedState()
applyMoves(s, parseAlg('x'))
console.log('frame after x :', frameMatrix(s))
console.log('isSolved(x)   :', isSolved(s), '(debería ser true: girar el cubo entero no lo desordena)')
const t = solvedState()
applyMoves(t, parseAlg('x R U2 R\' U\' R U\' R\''))
console.log('isSolved(plantado+alg):', isSolved(t))
const u = solvedState()
applyMoves(u, parseAlg('R U R2 U2'))
console.log('isSolved(R U R2 U2):', isSolved(u), '(debería ser false)')
// pegatinas tras una rotación de cubo: ninguna debe quedar sin color
const v = solvedState()
applyMoves(v, parseAlg('x R U R\' U R\' F R2 U\' R\' U\''))
const grid = ['U','D','F','B','R','L'].map((f) => [0,1,2].map((r) => [0,1,2].map((c) => faceletHome(v, f as never, r, c)).join('')))
console.log(grid.join('\n'))
console.log('pegatinas vacías:', grid.join('').split('').filter((ch) => ch === '').length)
