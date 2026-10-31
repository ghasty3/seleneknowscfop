/**
 * Gate duro de la lámina oficial de OLL (WCA, Feliks Zemdegs & Andy Klise) sobre el motor.
 * Fuente de datos: `scripts/fixtures/wca-oll.json` (extraída con `scripts/extract-wca-oll.mjs`).
 *
 * Comprueba tres cosas, y sale con código 1 si alguna falla:
 *  1. Notación: el parser del motor entiende los 128 algoritmos de la lámina (`r M S x y z R2' U2'`).
 *  2. Cierre: `plantado + alg = cubo resuelto`, con plantado = `inverse(alg)` aplicado al cubo resuelto.
 *  3. Prerequisito F2L (el que está rojo hoy): los algoritmos que NO rotan el cubo dejan las dos
 *     primeras capas resueltas en su plantado — es forzoso por construcción, así que 48 de 48 deben
 *     dar verde en `f2lSolved`. Si falla, el problema es la convención de matrices del motor
 *     (`project.md` §6.1 punto 1), no los datos de la lámina.
 *
 * Uso: npm run verify:wca   (o npx tsx scripts/check-wca-oll.mts)
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseAlg, applyMoves, caseState, isSolved } from '../src/cube/engine.ts'
import { f2lSolved } from '../src/cube/caseUtils.ts'

type Wca = { name: string; wca: number; prob: string; suggested: string[]; alt: string[] }
const OLL_WCA: Wca[] = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'wca-oll.json'), 'utf8'))

const parseFail: string[] = []
const solveFail: string[] = []
const f2lFail: string[] = []
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
  // Solo los algoritmos sin rotación de cubo: su plantado deja F2L resuelto en el marco de casa.
  const first = c.suggested[0]
  if (/(^|\s)[xyz]/.test(first)) continue
  noSetup++
  if (!f2lSolved(caseState(first))) f2lFail.push(`${c.name}(${c.wca}): ${first}`)
}

console.log(`casos: ${OLL_WCA.length} · algoritmos: ${algs} · sin rotación de cubo: ${noSetup}`)
console.log(`1) parser: ${parseFail.length === 0 ? 'OK' : parseFail.length + ' fallos'}`)
parseFail.slice(0, 10).forEach((s) => console.log('   ', s))
console.log(`2) plantado + alg resuelve: ${algs - solveFail.length}/${algs}`)
solveFail.slice(0, 10).forEach((s) => console.log('   ', s))
console.log(`3) F2L resuelto en el plantado: ${noSetup - f2lFail.length}/${noSetup}`)
f2lFail.slice(0, 10).forEach((s) => console.log('   ', s))

const gateOk = parseFail.length === 0 && solveFail.length === 0 && f2lFail.length === 0
console.log(gateOk ? 'GATE WCA: verde' : 'GATE WCA: rojo (Fase 0 del motor sin cerrar)')
process.exit(gateOk ? 0 : 1)
