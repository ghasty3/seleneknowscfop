/**
 * check-diagrams — auditoría automática de los diagramas de caso (OLL y PLL).
 *
 * Fuente de verdad: el propio motor. `caseState`/`canonicalView` dan el estado que el diagrama
 * tiene que pintar (inversa del algoritmo desde cubo resuelto, con la última capa arriba), y de ese
 * mismo estado salen las flechas, la pintura y los colores. Si el dibujo y el motor no coinciden,
 * la ficha miente: es el fallo del que se queja el usuario («sale todo resuelto menos una pieza»).
 *
 * Comprueba cinco cosas, sin navegador:
 *  GEOMETRÍA  las 12 celdas de la corona son las pegatinas de la ranura que dicen ser. Se mira en
 *             `gridToPos`: cada celda tiene que caer sobre la posición correcta de la cara, en la
 *             fila y la columna que el diagrama le asigna. Así se caza un espejo sin abrir la web.
 *  PINTURA    en PLL se pintan exactamente las piezas fuera de su sitio, cada una con su color
 *             lateral (el de la franja correspondiente), y ninguna pieza pintada está orientada.
 *  TOP        las 8 ranuras de arriba llevan piezas de la última capa (se pinta la capa que toca).
 *  FLECHAS    hay flecha por cada pieza fuera de su sitio, y ninguna sobre una que sí está.
 *  PISO       el estado pintado no es el cubo resuelto (una ficha nunca planta el cubo ya hecho).
 *
 * Veredatos por caso: OK · SOLVED · NOARROW · PHANTOM · FLAT · TWIST · TOP · PAINT · ARROWS
 * El veredicto ARROWS compara las flechas del SVG que de verdad pinta la web con las piezas
 * desplazadas del estado: invariant = cada pieza desplazada aporta UNA punta de flecha.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { caseRefs } from '../src/data/stages.ts'
import type { StageKey } from '../src/data/types.ts'
import { canonicalView, permOf, LL_CORNERS, LL_EDGES, type Pos } from '../src/cube/caseUtils.ts'
import { faceletHome, gridToPos, isSolved, type CubeState, type Face } from '../src/cube/engine.ts'
import { CaseDiagram, CROWN_CELLS, SIDE_CORNER, SIDE_EDGE } from '../src/components/CaseDiagram.tsx'

/**
 * La segunda pegatina lateral de cada esquina de la última capa (la que no da SIDE_CORNER), y las
 * celdas de la cara U de las 8 ranuras. Son las coordenadas de la rejilla, leídas con `gridToPos`.
 */
const SIDE_CORNER2: [Face, number, number][] = [['R', 0, 2], ['R', 0, 0], ['L', 0, 2], ['L', 0, 0]]
const U_CELL = (p: Pos) => ({ row: 1 - p[2], col: p[0] + 1 })

/**
 * Comprueba que la capa que el diagrama pinta es la capa U: las 8 ranuras de arriba tienen que
 * llevar piezas de la última capa (una pieza de arriba lleva la pegatina 'U' en su casa). Si aquí
 * cae una arista o esquina de otra capa, el dibujo está pintando una capa que no es la que se
 * está resolviendo, y las flechas no significan nada.
 */
function layerIsUp(state: CubeState) {
  const lettersOf = (facelets: [Face, number, number][]) =>
    facelets.map(([f, r, c]) => faceletHome(state, f, r, c))
  const edges = LL_EDGES.every((p, i) =>
    lettersOf([['U', U_CELL(p).row, U_CELL(p).col], SIDE_EDGE[i]]).includes('U'),
  )
  const corners = LL_CORNERS.every((p, i) =>
    lettersOf([['U', U_CELL(p).row, U_CELL(p).col], SIDE_CORNER[i], SIDE_CORNER2[i]]).includes('U'),
  )
  return edges && corners
}

// ---------- 1) geometría de la corona (se comprueba una sola vez) ----------
const posKey = (p: Pos) => `${p[0]}${p[1]}${p[2]}`
/** Nombre de la ranura que ocupa cada coordenada de la última capa (para poder leer el diagnóstico). */
const HOME_OF: Record<string, string> = {
  '111': 'UFR', '11-1': 'UBR', '-11-1': 'UBL', '-111': 'UFL',
  '011': 'UF', '110': 'UR', '01-1': 'UB', '-110': 'UL',
}
/**
 * Multiset esperado de las 12 celdas de la corona: cada esquina de la última capa aparece en sus
 * dos caras y cada arista en la suya. La corona no tiene que tocar ninguna pieza de otra capa.
 */
const EXPECTED_CROWN = ['UFL', 'UFL', 'UFR', 'UFR', 'UBR', 'UBR', 'UBL', 'UBL', 'UF', 'UB', 'UL', 'UR'].sort()
const crownNames: string[] = []
for (const face of ['F', 'B', 'L', 'R'] as const)
  CROWN_CELLS[face].forEach(([row, col]) => {
    const pos = gridToPos(face, row, col)
    crownNames.push(HOME_OF[posKey(pos)] ?? `NO-ULTIMA-CAPA(${face},${row},${col})`)
  })
const geomIssues: string[] = []
const got = crownNames.slice().sort()
if (got.join() !== EXPECTED_CROWN.join())
  geomIssues.push(`corona: las 12 celdas pintan [${got.join(' ')}] y deberían ser [${EXPECTED_CROWN.join(' ')}]`)
// Cada celda tiene que caer en la línea que el diagrama le asigna (F y B cuentan por columnas, L y R
// por filas): columna = 1 + x, fila = 1 + z. Aquí se ve un espejo o una cara torcida sin navegador.
const ALIGN: Record<'F' | 'B' | 'L' | 'R', 'col' | 'row'> = { F: 'col', B: 'col', L: 'row', R: 'row' }
for (const face of ['F', 'B', 'L', 'R'] as const)
  CROWN_CELLS[face].forEach(([row, col], i) => {
    const pos = gridToPos(face, row, col)
    const axis = ALIGN[face] === 'col' ? 1 + pos[0] : 1 + pos[2]
    if (axis !== i) geomIssues.push(`corona ${face}[${i}] = ${face}(${row},${col}) cae en la línea ${axis}, no en la ${i}`)
  })

// ---------- 2) y 3) por caso ----------
let bad = 0
const lines: string[] = []
const refs: ReturnType<typeof caseRefs> = []
for (const stage of ['oll', 'pll'] as StageKey[]) refs.push(...caseRefs(stage))
for (const ref of refs) {
  const { def } = ref
  if (def.expect !== 'oll' && def.expect !== 'pll') continue
  const { state } = canonicalView(def.algs[0])
  const solved = isSolved(state)
  const onTop = layerIsUp(state)
  const cPerm = permOf(state, LL_CORNERS)
  const ePerm = permOf(state, LL_EDGES)
  const movedC = cPerm.filter((p, i) => p !== i).length
  const movedE = ePerm.filter((p, i) => p !== i).length
  const moved = movedC + movedE

  // Colores que el diagrama pintaría en la cara U para este caso (misma lógica que CaseDiagram).
  const painted: string[] = []
  const twists: string[] = []
  LL_CORNERS.forEach((p, i) => {
    if (cPerm[i] === i) return
    const letter = faceletHome(state, SIDE_CORNER[i][0], SIDE_CORNER[i][1], SIDE_CORNER[i][2])
    painted.push(letter)
    if (letter === 'U') twists.push(`C${i}`)
  })
  LL_EDGES.forEach((p, i) => {
    if (ePerm[i] === i) return
    const letter = faceletHome(state, SIDE_EDGE[i][0], SIDE_EDGE[i][1], SIDE_EDGE[i][2])
    painted.push(letter)
    if (letter === 'U') twists.push(`E${i}`)
  })

  // Stickers de la última capa en los cuatro lados: cuántos salen con un color que no es el de la
  // cara en la que se dibujan. Si un caso permuta y salen todos «de casa», el dibujo sale con el
  // cubo resuelto (es el fallo que se ve en la pantalla) y las flechas quedan sobre piezas resueltas.
  const foreign = (['F', 'B', 'L', 'R'] as const)
    .flatMap((f) => CROWN_CELLS[f].map(([r, c]) => (faceletHome(state, f, r, c) === f ? 0 : 1)))
    .filter((n) => n === 1).length
  // La cara de arriba del estado canónico: en OLL tiene que ser la que cambie (si sale uniforme,
  // el dibujo de orientación sale plano, que es lo que se ve cuando la capa no es la de arriba).
  const upGrid = [0, 1, 2].map((r) => [0, 1, 2].map((c) => faceletHome(state, 'U', r, c)).join(''))
  const upIsUniform = new Set(upGrid.join('').split('')).size === 1

  // Flechas: se mide el SVG que pinta la web (puntas = piezas desplazadas; un intercambio antípodo
  // dibuja una sola línea con punta en cada extremo, así que la cuenta cuadra igual).
  const svg = renderToStaticMarkup(createElement(CaseDiagram, { state, mode: def.expect === 'pll' ? 'pll' : 'oll', label: ref.id }))
  const heads = (svg.match(/fill="#ffffff"/g) || []).length

  let verdict = 'OK'
  if (solved) verdict = 'SOLVED'
  else if (!onTop) verdict = 'TOP'
  else if (def.expect === 'oll' && upIsUniform) verdict = 'FLAT'
  else if (def.expect === 'pll' && moved > 0 && foreign === 0) verdict = 'PHANTOM'
  else if (def.expect === 'pll' && moved === 0) verdict = 'NOARROW'
  else if (def.expect === 'pll' && heads !== moved) verdict = 'ARROWS'
  else if (def.expect === 'oll' && heads > 0) verdict = 'ARROWS'
  else if (def.expect === 'pll' && twists.length) verdict = 'TWIST'
  else if (def.expect === 'pll' && painted.length !== moved) verdict = 'PAINT'
  if (verdict !== 'OK') bad++
  lines.push(`${verdict.padEnd(8)} ${ref.id.padEnd(10)} C${cPerm.join('')} E${ePerm.join('')} mov=${moved} flechas=${heads} pintado=[${painted.join('')}] foreign=${foreign} up=[${upGrid.join(' ')}] ${def.algs[0]}`)
}

console.log(geomIssues.length ? `GEOMETRÍA:\n  ${geomIssues.join('\n  ')}\n` : 'GEOMETRÍA: OK (12 celdas de la corona, fila y columna correctas)\n')
console.log(lines.join('\n'))
console.log(`\ncasos auditados: ${lines.length} · con problema: ${bad} · problemas de geometría: ${geomIssues.length}`)
if (bad + geomIssues.length > 0) process.exitCode = 1
