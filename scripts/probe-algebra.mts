import { solvedState, applyMoves, parseAlg, isSolved } from '../src/cube/engine.ts'

const run = (alg: string) => { const s = solvedState(); applyMoves(s, parseAlg(alg)); return isSolved(s) }
const rep = (alg: string, n: number) => Array(n).fill(alg).join(' ')

const tests: [string, boolean][] = [
  ['R4 = id', run(rep('R', 4))],
  ['U4 = id', run(rep('U', 4))],
  ['F4 = id', run(rep('F', 4))],
  ['R2 R2 = id', run('R2 R2')],
  ["R R' = id", run("R R'")],
  ['(R U)105 = id', run(rep('R U', 105))],
  ['(R U R2 U2)6 = id', run(rep('R U R2 U2', 6))],
  ['sexy x6 = id', run(rep("R U R' U'", 6))],
  ["(R U R' U R U2 R')6 = id", run(rep("R U R' U R U2 R'", 6))],
  ['M4 = id', run(rep('M', 4))],
  ['x4 = id', run(rep('x', 4))],
  ['y4 = id', run(rep('y', 4))],
  ['z4 = id', run(rep('z', 4))],
  ['x = R M\' L\'', run("x R' M L'")],
  ['y = U E\' D\'', run("y U' E D'")],
  ['z = F S B\'', run("z F' S' B")],
]
for (const [name, ok] of tests) console.log(ok ? 'ok  ' : 'FALLO', name)

// Orden real de cada generador y de pares
for (const g of ['R', 'U', 'F', 'L', 'D', 'B', 'M', 'E', 'S', 'x', 'y', 'z']) {
  let n = 1
  for (; n <= 12; n++) if (run(rep(g, n))) break
  console.log(`orden de ${g} = ${n <= 12 ? n : '>12'}`)
}
for (const p of ['R U', 'R F', 'U F', 'R D', 'L B', 'R M', 'U S', 'F E']) {
  let n = 1
  for (; n <= 120; n++) if (run(rep(p, n))) break
  console.log(`orden de (${p}) = ${n <= 120 ? n : '>120 (real: 105 para aristas/esquinas de caras adyacentes)'}`)
}
