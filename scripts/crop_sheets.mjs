/**
 * scripts/crop_sheets.mjs — recorta las planchas de la guía GAN en un PNG por caso.
 *
 * Uso:
 *   node scripts/crop_sheets.mjs <imagen> <stage> COLS=<x0,x1,x2,...> <codigos-col1> <codigos-col2> ...
 *
 * COLS = borde izquierdo de cada columna visual de la plancha (se ven imprimiendo las
 * bandas blancas verticales: son los huecos anchos que separan diagrama y textos).
 * Las filas se detectan solas: son las bandas horizontales casi blancas que separan
 * cada fila de celdas. Cada celda se recorta por su bounding box de contenido + pad.
 *
 * Dependencia de desarrollo: pngjs (no forma parte de la app).
 */
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const DARK = 175
const WHITE = 235
const PAD = 8
const MIN_SEP = 8

function lum(data, w, x, y) {
  const o = (y * w + x) * 4
  return (data[o] * 299 + data[o + 1] * 587 + data[o + 2] * 114) / 1000
}

function runsOf(flags, minLen = 1) {
  const out = []
  let start = null
  let last = null
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) {
      if (start === null) start = i
      last = i
    } else if (start !== null) {
      if (last + 1 - start >= minLen) out.push([start, last + 1])
      start = null
    }
  }
  if (start !== null && last + 1 - start >= minLen) out.push([start, last + 1])
  return out
}

const args = process.argv.slice(2)
const src = args.shift()
const stage = args.shift()
const colArg = args.find((a) => a.startsWith('COLS='))
if (!src || !stage || !colArg || args.length < 2) {
  console.error('uso: node scripts/crop_sheets.mjs <imagen> <stage> COLS=<x..> <codigos-col1> ...')
  process.exit(1)
}
const colStarts = colArg
  .slice(5)
  .split(',')
  .map((n) => parseInt(n, 10))
const codes = args.filter((a) => !a.startsWith('COLS=')).map((s) => s.split(',').map((c) => c.trim()))

const { width: w, height: h, data } = PNG.sync.read(fs.readFileSync(src))

/* filas de una columna: bandas horizontales casi blancas dentro de su ancho.
   Las columnas de la plancha no comparten las alturas de fila, así que se mide cada una. */
function rowBandsOf(x0, x1) {
  const white = []
  for (let y = 0; y < h; y++) {
    let c = 0
    for (let x = x0; x < x1; x++) if (lum(data, w, x, y) > WHITE) c++
    white.push(c / (x1 - x0) > 0.92)
  }
  const seps = runsOf(white, MIN_SEP)
  const bands = []
  for (let i = 0; i + 1 < seps.length; i++) {
    const a = seps[i][1]
    const b = seps[i + 1][0]
    if (b - a >= 12) bands.push([a, b])
  }
  return bands
}

const rightEdge = w
const colBands = colStarts.map((x0, i) => [x0, i + 1 < colStarts.length ? colStarts[i + 1] : rightEdge])
if (colBands.length !== codes.length) {
  console.error(`COLS da ${colBands.length} columnas y hay ${codes.length} listas de códigos`)
  process.exit(1)
}

console.log(`${path.basename(src)} ${w}x${h} · ${colBands.length} columnas`)
fs.mkdirSync(`public/ref/${stage}`, { recursive: true })

let n = 0
for (let c = 0; c < colBands.length; c++) {
  const [cx0, cx1] = colBands[c]
  const list = codes[c]
  const rowBands = rowBandsOf(cx0, cx1)
  if (list.length > rowBands.length) {
    console.error(`columna ${c + 1}: ${list.length} códigos para ${rowBands.length} filas`)
    process.exit(1)
  }
  for (let r = 0; r < list.length; r++) {
    const [ry0, ry1] = rowBands[r]
    /* bounding box de contenido dentro de la celda */
    let x0 = cx1, x1 = cx0, y0 = ry1, y1 = ry0
    for (let y = ry0; y < ry1; y++) {
      for (let x = cx0; x < cx1; x++) {
        if (lum(data, w, x, y) < DARK) {
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
    }
    if (x1 <= x0 || y1 <= y0) {
      console.error(`celda vacía en columna ${c + 1} fila ${r + 1}`)
      process.exit(1)
    }
    const ox = Math.max(0, x0 - PAD)
    const oy = Math.max(0, y0 - PAD)
    const cw = Math.min(w, x1 + 1 + PAD) - ox
    const ch = Math.min(h, y1 + 1 + PAD) - oy
    const out = new PNG({ width: cw, height: ch })
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const s = ((oy + y) * w + (ox + x)) * 4
        const d = (y * cw + x) * 4
        for (let k = 0; k < 4; k++) out.data[d + k] = data[s + k]
      }
    }
    fs.writeFileSync(`public/ref/${stage}/${list[r]}.png`, PNG.sync.write(out))
    n++
  }
}
console.log(`guardados ${n} recortes en public/ref/${stage}`)
