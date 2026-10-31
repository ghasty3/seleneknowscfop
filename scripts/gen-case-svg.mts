import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { CaseDiagram, caseMarkers, modeFor } from '../src/components/CaseDiagram'
import { canonicalView } from '../src/cube/caseUtils'
import { caseState } from '../src/cube/engine'
import { OLL } from '../src/data/oll'
import { PLL } from '../src/data/pll'
import { F2L } from '../src/data/f2l'
import type { CaseDef } from '../src/data/types'

/**
 * Generador de los diagramas exportables del proyecto.
 *
 * Dibuja con el MISMO componente que ve el usuario (`CaseDiagram`), así que el SVG en
 * `public/ref/` es idéntico a la ficha: no hay dos dibujos que se separan con el tiempo.
 * Cada fichero lleva el `xmlns` y una hoja de estilos propia (las pegatinas y las flechas
 * van con color en línea; los marcadores van por clase y esa clase vive en el CSS de la app).
 *
 * Uso: npm run svg
 */

/** Estilos de los marcadores, copiados de `src/styles/global.css` para el SVG suelto. */
const STYLE = `<style>
.dcell{stroke:rgba(0,0,0,.35);stroke-width:1}
.mk-corner,.mk-edge,.mk-target,.mk-home{pointer-events:none;fill:none}
.mk-target{stroke:#ff97c8;stroke-width:2;stroke-dasharray:5 3}
.mk-target path{fill:#ff97c8;stroke:none}
.mk-corner{stroke:#fff;stroke-width:2}
.mk-edge{stroke:#ff97c8;stroke-width:2}
.mk-home{stroke:#f2c94c;stroke-width:2}
text{font-family:system-ui,sans-serif;font-size:17px;font-weight:700;fill:#f2edfa}
</style>`

const GROUPS: { stage: string; list: CaseDef[] }[] = [
  { stage: 'oll', list: OLL },
  { stage: 'pll', list: PLL },
  { stage: 'f2l', list: F2L },
]

let total = 0
for (const { stage, list } of GROUPS) {
  const dir = `public/ref/${stage}`
  mkdirSync(dir, { recursive: true })
  for (const def of list) {
    const code = (def.ref?.split('/').pop() ?? String(def.code)).replace(/\.(png|svg)$/, '')
    // Estado plantado = el propio del caso (algoritmo inverso del resolutivo).
    const isF2l = (def.expect ?? '').startsWith('f2l')
    const planted = caseState(def.algs[0])
    const state = canonicalView(def.algs[0]).state
    const mode = modeFor(def)
    const markers = caseMarkers(def, isF2l ? planted : state)
    const markup = renderToStaticMarkup(
      createElement(CaseDiagram, {
        state: isF2l ? planted : state,
        markers,
        mode,
        size: 220,
        label: `Diagrama de ${def.name}`,
      }),
    )
    const svg = markup.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg"`)
    writeFileSync(`${dir}/${code}.svg`, `<?xml version="1.0" encoding="UTF-8"?>\n${STYLE}${svg}\n`)
    total++
  }
  console.log(`${stage}: ${list.length} casos`)
}
console.log(`diagramas SVG generados: ${total}`)
