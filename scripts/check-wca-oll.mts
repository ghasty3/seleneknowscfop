/**
 * Gate duro de la lámina oficial de OLL (WCA, Feliks Zemdegs & Andy Klise) sobre el motor.
 * Fuente de datos: `scripts/fixtures/wca-oll.json` (extraída con `scripts/extract-wca-oll.mjs`).
 *
 * Sale con código 1 si algo falla. Comprueba, en este orden:
 *  1. Notación: el parser entiende los 128 algoritmos de la lámina (`r M S x y z R2' U2'`).
 *  2. Cierre: `plantado + alg = cubo resuelto`, con plantado = `inverse(alg)` sobre el cubo resuelto.
 *     (Este punto es AGNÓSTICO de la convención de signos del motor: si el plantado se calcula con
 *     el mismo motor, cierra siempre. Por sí solo no dice que el motor sea un cubo real.)
 *  3. PUREZA de última capa — el que discrimina la convención: un algoritmo OLL que NO rota el cubo
 *     solo gira la última capa. Matemáticamente forzoso:
 *        a) ninguna pieza de casa con y<1 (capa D, anilla media y capa U' de casa) cambia de casa,
 *        b) los 4 centros de la ANILLA MEDIA están en su casa sin girar tras el plantado.
 *     Los 48 casos de la lámina sin rotación de cubo deben dar verde en las dos.
 *
 * Uso: npm run verify:wca   (o npx tsx scripts/check-wca-oll.mts)
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseAlg, applyMoves, caseState, isSolved } from '../src/cube/engine.ts'

type Wca = { name: string; wca: number; prob: string; suggested: string[]; alt: string[] }
const OLL_WCA: Wca[] = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'wca-oll.json'), 'utf8'))

const parseFail: string[] = []
const solveFail: string[] = []
const dirtyFail: string[] = []
const centerFail: string[] = []
let algs = 0
let noSetup = 0

for (const c of OLL_WCA) {
  for (const alg of [...c.suggested, ...c.alt]) {
    algs++
    try {
      const s = caseState(alg)
      applyMoves(s, parseAlg(alg))
      if (!isSolved(s)) solveFail.push(`${c.name}(${c.wca}): ${alg}`)
    } catch (e) {
      parseFail.push(`${c.name}(${c.wca}): ${alg} → ${(e as Error).message}`)
    }
  }
  const first = c.suggested[0]
  if (/(^|\s)[xyz]/.test(first)) continue // con rotación de cubo la pureza se lee contra los centros
  noSetup++
  const plantado = caseState(first)
  const dirty = plantado.cubies.filter((c) => c.home[1] < 1 && (c.pos[0] !== c.home[0] || c.pos[1] !== c.home[1] || c.pos[2] !== c.home[2]))
  if (dirty.length) dirtyFail.push(`${c.name}(${c.wca}): ${first} → ${dirty.length} piezas fuera de casa`)
  const badCenters = plantado.cubies.filter((c) => {
    // Anilla media: los 4 centros con casa y = 0. El centro de la cara de arriba puede quedar
    // retorcido cuando el algoritmo lleva una rotación de cubo implícita (M/r/f + giros de U);
    // eso es un efecto del marco (supercubo), no un fallo de las dos primeras capas.
    if (c.home[1] !== 0) return false
    return (
      c.pos[0] !== c.home[0] ||
      c.pos[1] !== c.home[1] ||
      c.pos[2] !== c.home[2] ||
      c.rot.some((v, i) => v !== (i % 4 === 0 ? 1 : 0))
    )
  })
  if (badCenters.length) centerFail.push(`${c.name}(${c.wca}): ${first} → ${badCenters.length} centros fuera de casa`)
}

console.log(`casos: ${OLL_WCA.length} · algoritmos: ${algs} · sin rotación de cubo: ${noSetup}`)
console.log(`1) parser: ${parseFail.length === 0 ? 'OK' : parseFail.length + ' fallos'}`)
parseFail.slice(0, 8).forEach((s) => console.log('   ', s))
console.log(`2) plantado + alg resuelve: ${algs - solveFail.length}/${algs}`)
solveFail.slice(0, 8).forEach((s) => console.log('   ', s))
console.log(`3a) alg de última capa no toca F2L: ${noSetup - dirtyFail.length}/${noSetup}`)
dirtyFail.slice(0, 8).forEach((s) => console.log('    ', s))
console.log(`3b) anilla central resuelta en el plantado: ${noSetup - centerFail.length}/${noSetup}`)

const gateOk = !parseFail.length && !solveFail.length && !dirtyFail.length && !centerFail.length
console.log(gateOk ? 'GATE WCA: verde' : 'GATE WCA: rojo (convención del motor sin cerrar)')
process.exit(gateOk ? 0 : 1)
