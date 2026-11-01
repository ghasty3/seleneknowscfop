/**
 * Gate de la cámara del visor 3D (scripts/check-cube-view.mts).
 *
 * Dos cosas se comprueban por separado, porque son dos cosas distintas:
 *  - el GESTO (mapear arrastre/rueda/flechas a cámara) se prueba sobre las funciones puras
 *    `orbitCam`, `zoomCam` y `nudgeCam`, que son exactamente las que llaman los manejadores;
 *  - lo que SALE de esa cámara se prueba renderizando `Cube3D` con `cam` controlada y contando
 *    la geometría del SVG (cuántas pegatinas se ven, hacia dónde se mueve una pegatina dada).
 * Así la órbita queda verificada sin DOM y sin runner de tests: node + tsx, como el resto.
 *
 *   npx tsx scripts/check-cube-view.mts
 */
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { solvedState } from '../src/cube/engine.ts'
import {
  DEFAULT_CAM,
  VBOX,
  DIST_MAX,
  DIST_MIN,
  PITCH_MAX,
  Cube3D,
  makeCamera,
  nudgeCam,
  orbitCam,
  projCam,
  stickerNormal,
  topView,
  frontView,
  zoomCam,
  type Cam,
} from '../src/components/Cube3D.tsx'

let bad = 0
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`  ${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`)
  if (!ok) bad++
}

const state = solvedState()
const render = (cam: Cam, mirrored = false) => renderToStaticMarkup(createElement(Cube3D, { state, size: 240, mirrored, cam }))
const stickers = (html: string) => (html.match(/class="sticker/g) ?? []).length
/** Centro proyectado de la pegatina frontal del cubie central. */
function frontX(cam: Cam, mirrored = false): number {
  const n = stickerNormal([1, 0, 0, 0, 1, 0, 0, 0, 1], 'F')
  const [x] = projCam(makeCamera(cam), n[0] * 0.5, n[1] * 0.5, 1 + n[2] * 0.5, mirrored)
  return x
}

console.log('Cámara del visor 3D')

// · la cámara por defecto es la de siempre (no hay regresión visual con la vista histórica)
const legacy = frontX(DEFAULT_CAM)
const legacyMirror = frontX(DEFAULT_CAM, true)
const rendered = render(DEFAULT_CAM)
check(stickers(rendered) === 27, 'la vista de defecto deja ver tres caras', `${stickers(rendered)} pegatinas`)
check(Number.isFinite(legacy) && legacy > 0, 'el centro de la cara frontal cae a la derecha de la pantalla', legacy.toFixed(1))

// · arrastrar: la cara frontal sigue el dedo
const pushed = orbitCam(DEFAULT_CAM, 60, 0)
check(pushed.yaw > DEFAULT_CAM.yaw, 'arrastrar a la derecha sube el yaw', `${DEFAULT_CAM.yaw.toFixed(3)} -> ${pushed.yaw.toFixed(3)}`)
check(frontX(pushed) > legacy, 'arrastrar a la derecha mueve la cara frontal hacia la derecha', `${legacy.toFixed(1)} -> ${frontX(pushed).toFixed(1)}`)
const pulled = orbitCam(DEFAULT_CAM, 0, 60)
check(pulled.pitch > DEFAULT_CAM.pitch, 'arrastrar hacia abajo sube la elevación (se ve más techo)', `${DEFAULT_CAM.pitch.toFixed(3)} -> ${pulled.pitch.toFixed(3)}`)
// · en el cubo espejado el gesto es el que se ve en pantalla, no el del mundo
const pushedMirror = orbitCam(DEFAULT_CAM, 60, 0, true)
check(pushedMirror.yaw < DEFAULT_CAM.yaw, 'espejo: arrastrar a la derecha baja el yaw', `${DEFAULT_CAM.yaw.toFixed(3)} -> ${pushedMirror.yaw.toFixed(3)}`)
check(frontX(pushedMirror, true) > legacyMirror, 'espejo: aun así la cara frontal se mueve a la derecha', `${legacyMirror.toFixed(1)} -> ${frontX(pushedMirror, true).toFixed(1)}`)

// · límites del pitch: miramos el techo de frente y el suelo de frente, sin dar la vuelta
const ceiling = orbitCam(DEFAULT_CAM, 0, 30000)
check(Math.abs(ceiling.pitch - PITCH_MAX) < 1e-9, 'el arrastre largo se queda en el cenit limitado', `${((ceiling.pitch * 180) / Math.PI).toFixed(1)}°`)
check(stickers(render(ceiling)) === 9, 'mirando de planta solo se ve la cara U', `${stickers(render(ceiling))} pegatinas`)
const floor = orbitCam(DEFAULT_CAM, 0, -30000)
check(Math.abs(floor.pitch + PITCH_MAX) < 1e-9, 'el arrastre largo se queda en el nadir limitado', `${((floor.pitch * 180) / Math.PI).toFixed(1)}°`)
check(stickers(render(floor)) === 9, 'mirando de planta por abajo solo se ve la cara D', `${stickers(render(floor))} pegatinas`)

// · dar la vuelta completa no pliega el eje y deja ver tres caras
const spun = orbitCam(DEFAULT_CAM, 8000, 0)
check(stickers(render(spun)) === 27, 'vuelta completa: siguen visibles tres caras', `${stickers(render(spun))} pegatinas`)
check(stickers(render({ yaw: Math.PI, pitch: PITCH_MAX - 0.01, dist: DEFAULT_CAM.dist })) === 9, 'cenit con yaw = 180° sigue mostrando 9 pegatinas', '')

// · zoom acotado
const near = zoomCam(DEFAULT_CAM, -4000)
check(near.dist >= DIST_MIN - 1e-9 && near.dist < DEFAULT_CAM.dist, 'la rueda acerca hasta su límite', `${DEFAULT_CAM.dist} -> ${near.dist.toFixed(2)}`)
const far = zoomCam(DEFAULT_CAM, 4000)
check(far.dist <= DIST_MAX + 1e-9 && far.dist > DEFAULT_CAM.dist, 'la rueda aleja hasta su límite', `${DEFAULT_CAM.dist} -> ${far.dist.toFixed(2)}`)
const span = (cam: Cam) => {
  const nums = render(cam).match(/-?[0-9.]+,-?[0-9.]+/g) ?? []
  const xs = nums.map((p) => Number(p.split(',')[0]))
  return Math.max(...xs) - Math.min(...xs)
}
const boxOf = (cam: Cam) => render(cam).split('viewBox="')[1].split('"')[0]
check(span(near) > span(far) * 1.4, 'acercar agranda el cubo de verdad', `cerca ${span(near).toFixed(1)} vs lejos ${span(far).toFixed(1)} unidades`)
check(boxOf(near) === boxOf(far) && boxOf(near) === boxOf(DEFAULT_CAM), 'la caja de recorte es fija (el cubo no crece al girar)', boxOf(near))
const orbited = span(orbitCam(DEFAULT_CAM, 300, 0))
check(Math.abs(orbited - span(DEFAULT_CAM)) / span(DEFAULT_CAM) < 0.25, 'orbitar solo cambia el tamaño lo que manda la perspectiva', `${span(DEFAULT_CAM).toFixed(1)} -> ${orbited.toFixed(1)} unidades`)
const spans = [near, far, DEFAULT_CAM, ceiling, orbitCam(DEFAULT_CAM, 500, 0), nudgeCam(DEFAULT_CAM, 0, 0, -1)].map(span)
check(Math.max(...spans) <= VBOX - 8, 'en ningún extremo el cubo se sale de la caja', `máx ${Math.max(...spans).toFixed(1)} de ${VBOX}`)
check(Math.max(...spans) / Math.min(...spans) > 1.5, 'la gama de zoom se nota', `de ${Math.min(...spans).toFixed(0)} a ${Math.max(...spans).toFixed(0)} unidades`)

// · teclas
const nudged = nudgeCam(DEFAULT_CAM, 1, 0, 0)
check(nudged.yaw > DEFAULT_CAM.yaw, 'flecha derecha gira a la derecha', '')
check(nudgeCam(DEFAULT_CAM, 0, -1, 0).pitch < DEFAULT_CAM.pitch, 'flecha arriba inclina hacia el techo', '')
check(nudgeCam(DEFAULT_CAM, 0, 0, -1).dist < DEFAULT_CAM.dist, 'tecla + acerca', '')
check(nudgeCam(DEFAULT_CAM, 1, 0, 0, true).yaw < DEFAULT_CAM.yaw, 'flecha derecha en espejo gira como se ve', '')
check(stickers(render(topView(DEFAULT_CAM.dist))) === 9, 'la vista «de arriba» deja solo la cara U', `${stickers(render(topView(DEFAULT_CAM.dist)))} pegatinas`)

// · el render es determinista: la misma cámara, mismo dibujo
check(render(DEFAULT_CAM) === render({ ...DEFAULT_CAM }), 'misma cámara produce el mismo dibujo', '')
// · y dos cámaras distintas producen dibujos distintos
check(render(DEFAULT_CAM) !== render(orbitCam(DEFAULT_CAM, 45, 12)), 'cámaras distintas producen dibujos distintos', '')


// · las ayudas de gesto: que se vea y se lea que el cubo se puede mover
const controlsHtml = renderToStaticMarkup(createElement(Cube3D, { state, size: 240, controls: true }))
check(['de arriba', 'de frente', 'reset', 'aria-label="Acercar el cubo"', 'aria-label="Alejar el cubo"'].every((t) => controlsHtml.includes(t)), 'la fila de vistas ofrece arriba, frente, reset y zoom', '')
check(rendered.includes('tabindex="0"') && rendered.includes('aria-label="Cubo en tres dimensiones'), 'el visor se enfoca y se autodescribe', '')
check(/arrastra para girar la vista[^"]*rueda para acercar/.test(rendered), 'la descripción dice qué gestos hay', '')
check(rendered.includes('class="cube3d-hit"') && rendered.includes('width="300" height="300"'), 'toda la caja es superficie de arrastre', '')

const css = readFileSync('src/styles/global.css', 'utf8')
check(/\.cube3d[^{]*\{[^}]*touch-action:/.test(css), 'el visor declara qué gestos de dedo se quedan en él', '')
check(/cursor:\s*grab/.test(css) && /cursor:\s*grabbing/.test(css), 'el cursor avisa de agarrar y de estar agarrando', '')
check(!/\.cube3d:focus[^{]*\{[^}]*outline:\s*none/.test(css), 'el foco del visor se ve', '')


// · las vistas de presets salen en cuadrícula RECTA (leerlas no debe costar)
function faceGrid(cam: Cam, face: 'U' | 'F') {
  const pts: [number, number][] = []
  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) pts.push(projCam(makeCamera(cam), ...(face === 'U' ? [a, 1.46, b] : [a, b, 1.46]) as [number, number, number]))
  }
  const uniq = (i: 0 | 1) => new Set(pts.map((p) => Math.round(p[i]))).size
  return { cols: uniq(0), rows: uniq(1) }
}
const topG = faceGrid(topView(DEFAULT_CAM.dist), 'U')
check(topG.cols === 3 && topG.rows === 3, 'la vista de arriba sale en cuadrícula recta, no en rombo', `${topG.cols} columnas · ${topG.rows} filas`)
const frontG = faceGrid(frontView(DEFAULT_CAM.dist), 'F')
check(frontG.cols === 3 && frontG.rows === 3, 'la vista de frente sale en cuadrícula recta', `${frontG.cols} columnas · ${frontG.rows} filas`)
const tiltG = faceGrid({ ...topView(DEFAULT_CAM.dist), yaw: DEFAULT_CAM.yaw }, 'U')
check(tiltG.cols > 3, 'con yaw heredado salía torcido (por eso los presets vuelven a yaw 0)', `${tiltG.cols} columnas`)

console.log(bad === 0 ? '\n  0 problemas' : `\n  ${bad} problemas`)
process.exitCode = bad === 0 ? 0 : 1
