/**
 * Extrae el contenido de `src/data/` a documentación Markdown legible.
 *
 * `npm run docs` regenera `docs/casos.md` (catálogo de casos por etapa, con
 * nombres, grupos, explicaciones, algoritmos y probabilidades) y
 * `docs/notacion.md` (tabla de notación con dedo sugerido y explicación).
 * Los datos de la web son la fuente: si un caso existe aquí, existe en la web.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { CROSS } from '../src/data/cross'
import { F2L } from '../src/data/f2l'
import { OLL } from '../src/data/oll'
import { PLL } from '../src/data/pll'
import { LOOK2 } from '../src/data/look2'
import { NOTATION } from '../src/data/notation'
import type { CaseDef } from '../src/data/types'

const OUT_DIR = new URL('../docs/', import.meta.url)
mkdirSync(OUT_DIR.pathname, { recursive: true })

type Row = CaseDef & { stage: string }

const PROBA: Record<string, string> = {
  '2L-1': '1/8 (de las siete cruces amarillas)',
  '2L-2': '1/8',
  '2L-3': '1/8',
  '1': '1/54 (OLL resuelto)',
  '2': '1/54',
}

function casos(rows: Row[], title: string, intro: string): string[] {
  const out: string[] = [`## ${title} — ${rows.length} casos`, '', intro, '']
  for (const c of rows) {
    out.push(`### ${c.stage} · ${c.code} — ${c.name}`)
    if (c.group) out.push(`- Grupo: ${c.group}`)
    if (c.short) out.push(`- Lectura: ${c.short}`)
    if (c.tips?.length) out.push(`- Consejos: ${c.tips.join(' · ')}`)
    out.push(`- Estado esperado: \`${c.expect}\``)
    if (PROBA[c.code]) out.push(`- Probabilidad: ${PROBA[c.code]}`)
    if (c.ref) out.push(`- Ilustración de referencia: \`${c.ref}\``)
    c.algs.forEach((alg, i) => out.push(`- Algoritmo ${i + 1}: \`${alg}\``))
    out.push('')
  }
  return out
}

const md: string[] = [
  '# Catálogo de casos',
  '',
  'Contenido de `src/data/`, extraído por `npm run docs`. Es el mismo material que',
  'muestra la web, en formato editable: sirve para revisar textos, añadir',
  'algoritmos y verificar la clasificación sin abrir el navegador.',
  '',
  'Los estados esperados (`expect`) son los que comprueba `npm run verify`: el',
  'algoritmo, aplicado al cubo plantado del caso, debe dejar el cubo resuelto.',
  'Los casos marcados *generado por simetría* los fabrica el motor aplicando el',
  'espejo R↔L; no son datos escritos a mano.',
  '',
  ...casos([...CROSS].map((c) => ({ ...c, stage: 'cross' })), 'Cruz (cross)', 'Seis posiciones de la arista blanco-verde con el verde de frente.'),
  ...casos([...F2L].map((c) => ({ ...c, stage: 'f2l' })), 'F2L', 'Pares colocados; el resto de los 41 pares se generan por simetría desde estos.'),
  ...casos([...LOOK2].map((c) => ({ ...c, stage: 'oll (2 look)' })), 'OLL en dos miradas', 'Atajo para el nivel básico: primero cruz, luego esquinas.'),
  ...casos([...OLL].map((c) => ({ ...c, stage: 'oll' })), 'OLL (57)', 'Los 57 casos completos, nombrados según las tablas de Gan.'),
  ...casos([...PLL].map((c) => ({ ...c, stage: 'pll' })), 'PLL (21)', 'Permutas de la última capa: adyacentes, opuestas, diagonal y ciclos.'),
]
writeFileSync(new URL('casos.md', OUT_DIR), md.join('\n'))

const not: string[] = [
  '# Notación',
  '',
  'Contenido de `src/data/notation.ts`, extraído por `npm run docs`.',
  '',
  '| Símbolo | Qué gira | Tipo | Dedo | Explicación |',
  '| --- | --- | --- | --- | --- |',
  ...NOTATION.map((n) => `| \`${n.sym}\` | ${n.label} | ${n.kind} | ${n.finger ?? '—'} | ${n.desc} |`),
  '',
  'Un símbolo va seguido de apóstrofo para media vuelta contraria y de 2 para vuelta completa.',
]
writeFileSync(new URL('notacion.md', OUT_DIR), not.join('\n'))

console.log(`docs/casos.md: ${md.length} líneas · docs/notacion.md: ${not.length} líneas`)
