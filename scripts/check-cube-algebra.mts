/**
 * Gate de REALIDAD del cubo (motor = cubo 3×3 de notación estándar).
 *
 * Este gate es el que de verdad discrimina la convención del motor; el cierre
 * `plantado + alg = resuelto` del gate de la lámina es agnóstico de signos y pasa siempre.
 * Aquí se comprueban hechos que solo son ciertos en un cubo real con notación estándar:
 * órdenes de los generadores, identidades conocidas, identidades de cortes (x = R M' L'),
 * el volteo 338, y la QUIRALIDAD del insertado F2L (dónde acaba la pareja y hacia dónde
 * mira su pegatina blanca, que es lo que ve una persona copiando el algoritmo en su cubo).
 *
 * Uso: npm run verify:cube
 */
import {
  solvedState,
  cloneState,
  applyMoves,
  parseAlg,
  isSolved,
  applyVec,
  type CubeState,
  type Cubie,
  type Mat,
} from '../src/cube/engine.ts'

const fails: string[] = []
const ok: string[] = []
function check(name: string, cond: boolean) {
  ;(cond ? ok : fails).push(name)
}

const run = (alg: string, base = solvedState()) => {
  const s = cloneState(base)
  applyMoves(s, parseAlg(alg))
  return s
}
const rep = (alg: string, n: number) => Array(n).fill(alg).join(' ')
const at = (s: CubeState, p: [number, number, number]) =>
  s.cubies.find((c) => c.pos[0] === p[0] && c.pos[1] === p[1] && c.pos[2] === p[2])!
const key = (v: number[]) => v.join(',')

// ---------- A. generadores de orden 4 ----------
for (const g of ['R', 'U', 'F', 'L', 'D', 'B', 'M', 'E', 'S']) {
  check(`orden 4 de ${g}`, isSolved(run(rep(g, 4))) && !isSolved(run(rep(g, 1))) && !isSolved(run(rep(g, 2))))
}
check("R R' = identidad", isSolved(run("R R'")))
check('R2 R2 = identidad', isSolved(run('R2 R2')))
check('sexy x6 = identidad', isSolved(run(rep("R U R' U'", 6))))
check('Sune x6 = identidad', isSolved(run(rep("R U R' U R U2 R'", 6))))
check('T-perm x2 = identidad', isSolved(run(rep("R U R' U' R' F R2 U' R' U' R U R' F'", 2))))

// ---------- B. identidades de cortes (x = R M' L', y = U E' D', z = F S B') ----------
check("x = R M' L'", isSolved(run("x L M R'")))
check("y = U E' D'", isSolved(run('y D E U')))
check("z = F S B'", isSolved(run("z B S' F'")))
check('r = R M', isSolved(run('r M R\'')))
check("u = U E'", isSolved(run('u E U\'')))
check('f = F S', isSolved(run("f S' F'")))

// ---------- C. un alg de última capa no baja nada ----------
const sune = run("R U R' U R U2 R'")
check(
  'Sune deja anilla media y cruz en casa',
  sune.cubies.filter((c) => c.home[1] < 1 && key(c.pos) !== key(c.home)).length === 0,
)
const fruf = run("F R U R' U' F'")
check(
  'F R U R\' U\' F\' solo mueve piezas de la última capa',
  fruf.cubies.filter((c) => c.home[1] < 1 && key(c.pos) !== key(c.home)).length === 0,
)

// ---------- D. volteo de aristas 338 (M U2 M' U2 M' U2 M) ----------
const flipSticker = (c: Cubie, homeAxis: [number, number, number]) => applyVec(c.rot as Mat, homeAxis)
const f338 = run("M U2 M' U2 M' U2 M")
const llEdges = [[-1,1,0],[0,1,-1],[1,1,0],[0,1,1]] as [number,number,number][]
const crossEdges = [[-1,-1,0],[0,-1,-1],[1,-1,0],[0,-1,1]] as [number,number,number][]
const corners = [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]] as [number,number,number][]
const flippedLL = llEdges.filter((p) => key(flipSticker(at(f338, p), [0,1,0])) !== '0,1,0').length
const flippedCross = crossEdges.filter((p) => key(flipSticker(at(f338, p), [0,-1,0])) !== '0,-1,0').length
const flippedCorners = corners.filter((p) => key(flipSticker(at(f338, p), [0,1,0])) !== '0,1,0').length
check(`338 voltea 2 aristas de arriba y 2 de la cruz (medido: ${flippedLL}+${flippedCross})`, flippedLL === 2 && flippedCross === 2)
check('338 no voltea esquinas', flippedCorners === 0)
check(
  '338 deja todas las piezas en su capa',
  f338.cubies.filter((c) => c.pos[1] !== c.home[1]).length === 0,
)

// ---------- E. QUIRALIDAD del insertado F2L (R U R' U') ----------
// En un cubo real con la cruz abajo, `R U R' U'` saca la pareja del hueco FR y la deja en la
// capa U con la pegatina blanca MIRANDO A LA IZQUIERDA (insertado a mano izquierda). Si el motor
// estuviera especularizado, la blanca miraría a la derecha y la vista 3D enseñaría lo contrario
// de lo que hace la persona sobre su cubo.
const P = run("R U R' U'")
const parEje = at(P, [0, 1, 1])
const parEsq = at(P, [-1, 1, 1])
check(
  'R U R\' U\' saca la pareja del hueco FR a la capa U',
  key(parEje.home) === '0,-1,1' && key(parEsq.home) === '-1,-1,1',
)
check('la pareja queda con la blanca mirando a la izquierda', key(flipSticker(parEje, [0,-1,0])) === '-1,0,0' && key(flipSticker(parEsq, [0,-1,0])) === '-1,0,0')
check('el hueco FR queda ocupado por piezas de arriba', String(at(P,[1,0,1]).home[1]) === '1' && String(at(P,[1,-1,1]).home[1]) === '1')
// Y el insertado de la izquierda lo deshace: pareja en UF+UFL con la blanca a la izquierda → U' L' U L
check("U' L' U L reinserta esa pareja", isSolved(run("U' L' U L", P)))
// La mano derecha: pareja en UF+UFR con la blanca a la derecha → U R U' R'
const P2 = run("L U' L' U")
const dEje = at(P2, [0, 1, 1])
const dEsq = at(P2, [1, 1, 1])
check('la pareja de la derecha queda con la blanca mirando a la derecha', key(flipSticker(dEje, [0,-1,0])) === '1,0,0' && key(flipSticker(dEsq, [0,-1,0])) === '1,0,0')
check("U R U' R' reinserta la pareja derecha", isSolved(run("U R U' R'", P2)))

// ---------- F. (R U)^105 deja las 20 piezas en casa (los centros pueden retorcerse) ----------
const ru = run(rep('R U', 105))
check('(R U)105 deja las 20 piezas en casa', ru.cubies.filter((c) => c.home.filter((v) => v !== 0).length >= 2 && (key(c.pos) !== key(c.home) || c.rot.some((v, i) => v !== (i % 4 === 0 ? 1 : 0)))).length === 0)

// ---------- salida ----------
for (const t of ok) console.log('ok  ', t)
for (const t of fails) console.log('FALLO', t)
console.log(fails.length ? `GATE CUBO: rojo (${fails.length} hechos que no son de un cubo real)` : 'GATE CUBO: verde (el motor es un cubo 3×3 de notación estándar)')
process.exit(fails.length ? 1 : 0)
