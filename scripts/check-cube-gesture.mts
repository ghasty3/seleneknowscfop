// Gate del gesto de dedo sobre el cubo 3D: arrastrar una pegatina tiene que traer la capa que el
// dedo espera, desde CUALQUIER vista (la de tres cuartos, la planta de arriba y el cubo espejado).
// Se ejecuta aquí, no en el navegador: `dragMove` es función pura (estado + vector del dedo +
// cámara viva → movimiento), así que la regla se puede comprobar de verdad.
//
// Las expectativas son de física, no de implementación: para cada arrastre se dice adónde tiene que
// ir a parar el cubie. El id se comprueba contra la notación de standards.cubing.net.
//
//   npx tsx scripts/check-cube-gesture.mts
import { solvedState, applyMove, cloneState, type CubeState } from '../src/cube/engine.ts'
import { DEFAULT_CAM, DIST0, frontView, topView } from '../src/components/Cube3D.tsx'
import { dragMove } from '../src/components/InteractiveCube.tsx'

let bad = 0
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`  ${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`)
  if (!ok) bad++
}

const P = (s: CubeState, i: number) => s.cubies[i].pos.join(',') as `${number}${number}${number}`
const idxOf = (s: CubeState, pos: [number, number, number]) => s.cubies.findIndex((c) => c.pos.join(',') === pos.join(','))

type Case = {
  titulo: string
  pos: [number, number, number]
  face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
  dedo: [number, number]
  cam?: 'default' | 'top' | 'front'
  mirrored?: boolean
  aParar: [number, number, number]
}

const casos: Case[] = [
  {
    titulo: 'pegatina de F hacia abajo → la pegatina baja por la cara F',
    pos: [-1, 1, 1],
    face: 'F',
    dedo: [0, 40],
    aParar: [-1, -1, 1],
  },
  {
    titulo: 'pegatina de F hacia la derecha → se la lleva la capa de arriba',
    pos: [-1, 1, 1],
    face: 'F',
    dedo: [40, 0],
    aParar: [1, 1, 1],
  },
  {
    titulo: 'pegatina de F hacia arriba → sube por la cara F',
    pos: [-1, -1, 1],
    face: 'F',
    dedo: [0, -40],
    aParar: [-1, 1, 1],
  },
  {
    titulo: 'espejado, abajo: el gesto vertical no cambia',
    pos: [-1, 1, 1],
    face: 'F',
    dedo: [0, 40],
    mirrored: true,
    aParar: [-1, -1, 1],
  },
  {
    titulo: 'espejado, derecha: la derecha de la pantalla es la izquierda del mundo',
    pos: [-1, 1, 1],
    face: 'F',
    dedo: [40, 0],
    mirrored: true,
    aParar: [-1, 1, -1],
  },
  {
    titulo: 'en planta, la pegatina de U que baja hacia F se la lleva la tajada derecha',
    pos: [1, 1, -1],
    face: 'U',
    dedo: [0, 40],
    cam: 'top',
    aParar: [1, 1, 1],
  },
  // En la vista de frente la cara de arriba se ve de canto, así que las únicas capas que
  // llevan esa pegatina son la tajada central y la capa de atrás: la de atrás es la que la
  // mueve hacia la derecha de la pantalla.
  {
    titulo: 'de frente (cara de arriba de canto), la pegatina de U que se va a la derecha se la lleva la capa de atrás',
    pos: [0, 1, -1],
    face: 'U',
    dedo: [40, 0],
    cam: 'front',
    aParar: [1, 0, -1],
  },
]

console.log('Gesto de arrastre sobre pegatina')

for (const c of casos) {
  const cam = c.cam === 'top' ? topView(DIST0) : c.cam === 'front' ? frontView(DIST0) : DEFAULT_CAM
  const st = solvedState()
  const i = idxOf(st, c.pos)
  const pick = dragMove(st, i, c.face, c.pos, c.dedo[0], c.dedo[1], cam, Boolean(c.mirrored))
  if (!pick) {
    check(false, `${c.titulo}`, 'no eligió ningún movimiento')
    continue
  }
  const after = cloneState(st)
  applyMove(after, { id: pick.id, axis: pick.axis, layers: [pick.layer], dir: pick.dir })
  // Se comprueba a dónde va la pegatina, que es lo físico y no depende de cómo se escriba
  // la letra: el dedo se lleva la pegatina a la posición prometida. El identificador elegido
  // se imprime para poder leer qué capa usó el gesto.
  // El umbral de alinhamento es más bajo en la vista de frente con la cara de arriba de canto:
// ahí la pegatina se mueve casi en profundidad y su recorrido proyectado se ve escorzado.
const umbral = c.cam === 'front' ? 0.6 : 0.85
check(P(after, i) === c.aParar.join(',') && pick.score >= umbral, c.titulo, `${pick.id} (score ${pick.score.toFixed(2)}) · el cubie a ${P(after, i)}`)
}

// · sin recorrido no hay gesto (el toque simple lo atiende el componente, no esta regla)
const st0 = solvedState()
check(dragMove(st0, idxOf(st0, [-1, 1, 1]), 'F', [-1, 1, 1], 0, 0, DEFAULT_CAM, false) === null, 'sin recorrido de dedo no se gira nada', '')

// · la tajada central existe: la pegatina de U de la arista UF arrastrada a la izquierda se va por
//   la tajada M (capa 0), que es justo lo que hace un cubo de verdad en la mano
const slice = dragMove(st0, idxOf(st0, [0, 1, 1]), 'U', [0, 1, 1], -40, 0, DEFAULT_CAM, false)
check(Boolean(slice) && slice!.layer === 0, 'arrastrar la arista frontal por el centro usa la tajada central', slice ? `${slice.id} (capa ${slice.layer})` : 'nada')

// · el arrastre largo elige capa (no se lo traga el toque simple) y coincide con el arrastre
//   corto de la misma dirección: el gesto no depende de la fuerza del dedo
const largo = dragMove(st0, idxOf(st0, [-1, 1, 1]), 'F', [-1, 1, 1], 0, 90, DEFAULT_CAM, false)
const corto = dragMove(st0, idxOf(st0, [-1, 1, 1]), 'F', [-1, 1, 1], 0, 12, DEFAULT_CAM, false)
check(Boolean(largo) && Boolean(corto) && largo!.id === corto!.id, 'un dedo rápido abajo da el mismo giro que uno suave', `${largo ? largo.id : 'nada'} = ${corto ? corto.id : 'nada'}`)

console.log(bad === 0 ? '\n  0 problemas' : `\n  ${bad} problemas`)
process.exitCode = bad === 0 ? 0 : 1
