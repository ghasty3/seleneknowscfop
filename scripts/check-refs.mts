// Comprobación de las imágenes de referencia de los casos.
//
// Reglas duras (salida 1 si se incumplen):
//   1. Toda ruta `ref` de un caso existe como fichero en `public/` (diagramas SVG propios).
//   2. Dos casos de la misma etapa no pueden compartir la misma imagen: cada
//      caso tiene su propia posición de piezas y una foto compartida miente.
//
// Regla blanda (informativa): en OLL y PLL el número del fichero debería
// coincidir con el código del caso, porque las tablas de Gan numeran igual.
// Una discrepancia significa que la ilustración no es el caso que se describe.
import {existsSync} from 'node:fs'
import {OLL} from '../src/data/oll'
import {PLL} from '../src/data/pll'
import {F2L} from '../src/data/f2l'

type C = {code: string; name: string; ref?: string}
const stages: Array<[string, C[]]> = [['oll', OLL], ['pll', PLL], ['f2l', F2L]]
const fallos: string[] = []
const avisos: string[] = []

for (const [stage, casos] of stages) {
  const sinRef = casos.filter(c => !c.ref).map(c => c.code)
  const conRef = casos.filter(c => c.ref)
  const faltan = conRef.filter(c => !existsSync(new URL('public' + c.ref, new URL('../', import.meta.url)).pathname))
  const porRef = new Map<string, string[]>()
  for (const c of conRef) porRef.set(c.ref!, [...(porRef.get(c.ref!) ?? []), c.code])
  const compartidas = [...porRef].filter(([, v]) => v.length > 1)
  const desfasadas = stage === 'f2l' ? [] : conRef
    .filter(c => c.ref !== `/ref/${stage}/${c.code}.svg`)
    .map(c => `${c.code} → ${c.ref!.split('/').pop()}`)

  if (faltan.length) fallos.push(`${stage}: ${faltan.length} imágenes inexistentes: ${faltan.map(c => c.ref).join(' ')}`)
  if (compartidas.length) fallos.push(`${stage}: ${compartidas.length} imágenes compartidas por varios casos: ${compartidas.slice(0, 8).map(([r, v]) => `${r.split('/').pop()} = ${v.join('+')}`).join(' ')}`)
  avisos.push(`${stage}: ${casos.length} casos, ${conRef.length} con imagen, ${sinRef.length} sin imagen, ${desfasadas.length} con número que no coincide con el código.`)
  if (desfasadas.length) avisos.push(`  ${desfasadas.slice(0, 12).join(', ')}${desfasadas.length > 12 ? ' …' : ''}`)
}

for (const a of avisos) console.log(a)
if (fallos.length) {
  console.log('\nFallos:')
  for (const f of fallos) console.log('- ' + f)
  process.exit(1)
}
console.log('\nTodas las rutas de imagen existen y ninguna está compartida.')
