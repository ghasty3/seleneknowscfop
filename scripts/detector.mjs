#!/usr/bin/env node
/**
 * Detector técnico propio (el `detector.mjs` que acompaña a la skill no venía
 * instalado y no se pudo recuperar; este script cubre las reglas P que se
 * pueden comprobar de forma determinista sobre el CSS y el marcado).
 *
 *   node scripts/detector.mjs [src/styles/global.css]
 */
import { readFileSync } from 'node:fs'

const cssPath = process.argv[2] ?? 'src/styles/global.css'
const css = readFileSync(cssPath, 'utf8')
const tsx = process.argv[3] ? readFileSync(process.argv[3], 'utf8') : ''
const findings = []
const add = (rule, severity, message) => findings.push({ rule, severity, message })

const norm = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
const body = norm(css)
/** Última declaración de un selector: gana en el cascade. */
const lastRule = (selector) => {
  const re = new RegExp(`\\.${selector}[^{]*\\{([^}]*)\\}`, 'gi')
  let out = null
  for (const m of body.matchAll(re)) if (m[1]) out = m[1]
  return out
}
const lastValue = (selector, prop) => {
  const rule = lastRule(selector)
  if (!rule) return null
  const m = [...rule.matchAll(new RegExp(`${prop}:\\s*([^;]+)`, 'gi'))].pop()
  return m ? m[1].trim() : null
}

/* P5 · redondeo: ningún radio de botones/contenedor por encima de 14 px. */
const radii = [...body.matchAll(/border-radius:\s*([^;]+);/g)].flatMap((m) => m[1].split(' ')).map((v) => parseFloat(v)).filter((v) => !Number.isNaN(v))
const bigRadii = radii.filter((v) => v > 14)
if (bigRadii.length) add('P5', 2, `border-radius > 14px en ${bigRadii.length} declaraciones (máx ${Math.max(...bigRadii)}px)`)

/* P6 · tipografía: pesos usados y tamaños en cuerpo de texto. */
const weights = [...new Set([...body.matchAll(/font-weight:\s*(\d+)/g)].map((m) => +m[1]))]
if (weights.includes(900) || weights.includes(950)) add('P6', 1, 'font-weight 900/950: los grotescos del sistema no tienen ese peso')

/* P11 · blancos puros y negros puros. */
const pureColor = (re) => [...body.matchAll(/(?:color|background|background-color|border-color|fill|stroke|box-shadow)\s*:[^;]*?\b(#[0-9a-f]{3,8}|white|black)\b/gi)]
  .map((m) => m[1].toLowerCase()).filter((v) => re.test(v))
const pureWhite = pureColor(/^#ffffff$|^#fff$|^white$/)
const pureBlack = pureColor(/^#000000$|^#000$|^black$/)
if (pureWhite.length) add('P11', 2, `blanco puro como color declarado (${pureWhite.length}x): usa el marfil de la paleta`)
if (pureBlack.length) add('P11', 2, `negro puro como color declarado (${pureBlack.length}x): usa el tinta de la paleta`)

/* P28 · bordes: debe haber varias tonalidades de borde, todas tintadas. */
const borderColors = [...new Set([
  ...body.matchAll(/border[^;]*?:\s*[^;]*?(#[0-9a-f]{3,8}|rgba?\([^)]*\)|var\(--[a-z0-9-]+\))/gi)
].map((m) => m[1].toLowerCase()))]
const grayHex = borderColors.filter((c) => /^#[0-9a-f]{6}$/.test(c) && c.slice(1, 3) === c.slice(3, 5) && c.slice(3, 5) === c.slice(5, 7))
if (borderColors.length < 2) add('P28', 2, `un solo color de borde (${borderColors.join(', ') || 'ninguno'}): la superficie queda pegajosa`)
if (grayHex.length) add('P28', 2, `bordes con gris puro sin tono: ${grayHex.join(', ')}`)

/* P7 · paredes de bordes de 1px: si todos los paneles llevan borde de 1px, nada respira. */
const onePxBlocks = [...body.matchAll(/\.([a-z0-9-]+)\s*\{[^}]*border:\s*1px solid[^}]*\}/gi)].map((m) => m[1])
if (onePxBlocks.length >= 6) add('P7', 2, `${onePxBlocks.length} bloques con borde de 1px (${onePxBlocks.slice(0, 6).join(', ')}…): usa sombra de capa y bordes selectivos`)

/* P12 · acento: share de color saturado. */
const dataColors = [...css.matchAll(/--c-face[a-z-]*:\s*(#[0-9a-f]{6})/gi)].map((m) => m[1].toLowerCase())
const hexes = [...body.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()).filter((h) => !dataColors.includes(h))
const sat = hexes.filter((h) => {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16)
  return Math.max(r, g, b) - Math.min(r, g, b) > 60
})
if (hexes.length && sat.length / hexes.length > 0.25) add('P12', 2, `${sat.length}/${hexes.length} colores saturados: el acento ocupa más del 25% de la paleta`)

/* P10 · degradados en texto. */
if (/background\s*:-webkit-linear-gradient/.test(css) && /-webkit-background-clip:\s*text|background-clip:\s*text/.test(css))
  add('P10', 1, 'texto con relleno de degradado')

/* P14 · hero centrado con h1 + lead centrados. */
if (/\.hero[^{]*\{[^}]*text-align:\s*center/.test(body)) add('P14', 1, 'hero centrado con h1 y lead centrados')

/* P2 · navegación pegada: separación mínima entre enlaces y botón de la barra. */
const navGap = lastValue('nav', 'gap') ?? lastValue('topnav', 'gap')
if (navGap && parseFloat(navGap) < 12) add('P2', 2, `gap de la barra de navegación = ${navGap} (mínimo 12px)`)
const brandPad = lastValue('brand', 'padding')
const brandMin = lastValue('brand', 'min-height')
const brandH = brandMin ? parseFloat(brandMin) : brandPad ? brandPad.split(' ').map(parseFloat).reduce((a, b) => a + b, 0) + 22 : 0
if (brandH && brandH < 44) add('P2', 1, `altura del enlace de marca ≈ ${Math.round(brandH)}px (< 44px: el texto actúa como botón sin caja)`)

/* P26 · objetivos táctiles pequeños. */
const btnPad = lastValue('btn', 'padding')
const btnMinH = lastValue('btn', 'min-height')
const btnH = btnMinH ? parseFloat(btnMinH) : btnPad ? btnPad.split(' ').map(parseFloat)[0] * 2 + 22 : 0
if (btnH && btnH < 40) add('P26', 2, `altura de .btn ≈ ${Math.round(btnH)}px (< 40px en pantallas táctiles)`)

/* P23 · radios anidados: panel interno con el mismo radio que el contenedor. */
const nested = [...body.matchAll(/\.([a-z0-9-]+)\s*\{[^}]*border-radius:\s*(\d+)px[^}]*\}\s*\.([a-z0-9-]+)\s*\{[^}]*border-radius:\s*(\d+)px/g)]
for (const m of nested) if (m[2] === m[4] && +m[2] >= 8) add('P23', 2, `.${m[1]} y .${m[3]} comparten radio ${m[2]}px (anidación muneca-muñeca)`)

/* P16 · disparadores de movimiento prohibidos. */
if (/animation[^;]*\b(infinite|loop)\b/i.test(body)) add('P16', 1, 'animación en bucle infinito (solo puede dispararse por interacción)')

/* P31 · padding simétrico en elementos con iconos. */
for (const sel of ['btn', 'chip', 'pad-btn']) {
  const gap = lastValue(sel, 'gap')
  const pad = lastValue(sel, 'padding')
  if (gap && pad) {
    const parts = pad.split(' ').map(parseFloat)
    const h = parts[1] ?? parts[0]
    if (parts[0] !== h) add('P31', 2, `.${sel} con gap ${gap} y padding asimétrico (${pad}): un icono separado del texto exige padding simétrico`)
  }
}

/* Marca: nada de nombres largos con CamelCase en la UI. */
if (/[a-z]+[A-Z][a-zA-Z]{4,}/.test(tsx)) add('MARK', 2, 'identificador CamelCase expuesto en marcado')

if (!findings.length) {
  console.log(`detector: sin hallazgos en ${cssPath}`)
} else {
  for (const f of findings) console.log(`[${f.rule}] sev ${f.severity} · ${f.message}`)
  console.log(`detector: ${findings.length} hallazgo(s) en ${cssPath}`)
}
