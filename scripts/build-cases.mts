// Genera src/data/oll.ts y src/data/pll.ts a partir de las librerías contrastadas.
// Cada caso lleva primero el algoritmo de la librería pública (que el motor verifica)
// y después las variantes de la lámina GAN que son EL MISMO caso (misma firma de última capa).
// La imagen oficial de GAN se asigna también por firma, no por número: los números de GAN
// no coinciden con la numeración estándar.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { caseState } from '../src/cube/engine'
import { applyMoves, parseAlg } from '../src/cube/engine'
import { LL_CORNERS, LL_EDGES, canonicalView, llCornerOriented, llEdgeOriented, ollPattern, permOf } from '../src/cube/caseUtils'
import { OLL as OLL_OLD } from '../src/data/oll.gan'
import { PLL as PLL_OLD } from '../src/data/pll.gan'

const FIX = (f: string) => JSON.parse(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8')) as { alg: string; n?: number; code?: string }[]
const clone = (s: ReturnType<typeof caseState>) => ({ cubies: s.cubies.map((c) => ({ ...c, pos: [...c.pos] as [number, number, number], rot: [...c.rot] as [number, number, number] })) })

/** firma de orientación (OLL): aristas y esquinas de la U, canónica bajo rotaciones U */
function orientSig(alg: string) {
  const s = caseState(alg)
  const e = LL_EDGES.map((p) => (llEdgeOriented(s, p) ? '1' : '0'))
  const c = LL_CORNERS.map((p) => (llCornerOriented(s, p) ? '1' : '0'))
  return Array.from({ length: 4 }, (_, k) => [...e.slice(k), ...e.slice(0, k)].join() + '|' + [...c.slice(k), ...c.slice(0, k)].join()).sort()[0]
}

/** firma de permutación (PLL): canónica bajo las 24 rotaciones del cubo entero */
function permSig(alg: string) {
  const base = caseState(alg)
  const keys: string[] = []
  for (const ax of ['x', 'y', 'z'] as const) {
    for (let t = 0; t < 4; t++) {
      const s = clone(base)
      applyMoves(s, parseAlg(Array(t).fill(ax).join(' ')))
      keys.push(permOf(s, LL_CORNERS).join() + '|' + permOf(s, LL_EDGES).join())
    }
  }
  return keys.sort()[0]
}

const sigCache = new Map<string, string>()
/** firma del alg transcrito de GAN, cacheada */
const oldSig = (alg: string, kind: 'oll' | 'pll') => {
  const k = kind + alg
  if (!sigCache.has(k)) sigCache.set(k, (kind === 'oll' ? orientSig : permSig)(alg))
  return sigCache.get(k)!
}

const cropFor = (code: string, dir: 'oll' | 'pll') => {
  for (const cand of [code, code + 'a', code + 'b', code.replace('1', 'a').replace('2', 'b')]) {
    const p = `/ref/${dir}/${cand}.png`
    if (existsSync(new URL(`../public${p}`, import.meta.url))) return p
  }
  return undefined
}

/** ¿este alg resuelve el plantado del caso? (prueba estricta, la que usa el jugador) */
function solves(plantadoAlg: string, alg: string) {
  const s = caseState(plantadoAlg)
  applyMoves(s, parseAlg(alg))
  return s.cubies.every((c) => c.pos[0] === c.home[0] && c.pos[1] === c.home[1] && c.pos[2] === c.home[2] && c.rot[0] === 1)
}

/** variantes legítimas del mismo caso: conjugaciones por U (el caso es U-invariante) */
const conjugates = (alg: string) => ["U", "U2", "U'"].map((u) => `${u} ${alg} ${u === "U'" ? 'U' : u === 'U' ? "U'" : 'U2'}`)


/**
 * ¿el plantado de `a` es un caso canónico de su tipo? La última capa tiene que quedar arriba
 * (en el marco canónico: centro amarillo arriba) y las dos primeras capas resueltas; la última
 * capa tiene que estar torcida (OLL) o orientada (PLL). `llView` normaliza la preparación
 * escribiendo la rotación que la deja en esa vista.
 */
function canonical(a: string, kind: 'oll' | 'pll'): boolean {
  const view = canonicalView(a)
  const s = view.state
  const p = ollPattern(s)
  const oriented = p.edges === 'cross' && p.unorientedCorners === 0
  return kind === 'pll' ? oriented : !oriented
}

/**
 * Las librerías públicas escriben a veces el algoritmo dando por hecha la preparación
 * (`y`, `y2`, `x`) y no la escriben. Aquí se busca la preparación que convierte el alg
 * en un caso canónico: sin ella el plantado saldría con la última capa torcida.
 */
function withSetup(alg: string, kind: 'oll' | 'pll'): string {
  const setups = ['', 'y', 'y2', "y'", 'x', "x'", 'x2', 'z', "z'", 'y2 x']
  for (const S of setups) {
    const a = S ? `${S} ${alg}` : alg
    if (canonical(a, kind) && solves(a, a)) return a
  }
  return alg
}

function build(kind: 'oll' | 'pll') {
  const sig = kind === 'oll' ? orientSig : permSig
  const fixture = FIX(kind === 'oll' ? 'cubzor-oll.json' : 'cubzor-pll.json')
  const old = kind === 'oll' ? OLL_OLD : PLL_OLD
  const out: { code: string; name: string; algs: string[]; ref?: string }[] = []
  const noImage: string[] = []
  for (const t of fixture) {
    const code = kind === 'oll' ? String(t.n) : String(t.code)
    const name = kind === 'oll' ? `OLL ${t.n}` : `PLL ${t.code}`
    const mine = sig(t.alg)
    // variantes: conjugaciones por U + transcripciones GAN que de verdad resuelven ESTE plantado
    const gan = old.filter((c) => oldSig(c.algs[0], kind) === mine && solves(t.alg, c.algs[0]))
    const main = withSetup(t.alg, kind)
    // variantes: las de la lámina GAN que cierran desde ESTE plantado (el motor las comprueba),
    // más las conjugaciones por U del principal; todas pasan por la vista canónica
    const extra = gan
      .map((c) => (c.algs[0].startsWith('R U2 R2 F R') ? 'y2 ' + c.algs[0] : c.algs[0]))
      .map((a) => withSetup(a, kind))
    const cand = [main, ...extra, ...conjugates(main)]
    const algs = cand.filter((a, i, arr) => arr.indexOf(a) === i && canonical(a, kind) && solves(a, a)).slice(0, 4)
    if (!algs.length) algs.push(main)
    // imagen GAN: solo si el caso GAN empareja de forma única por firma
    const twin = old.filter((c) => oldSig(c.algs[0], kind) === mine)
    const ref = twin.length === 1 ? cropFor(twin[0].code, kind) : undefined
    if (!ref) noImage.push(name)
    out.push({ code, name, algs, ref })
  }
  const lines = [
    `// Autogenerado con scripts/build-cases.mts — no editar a mano.`,
    `// Algoritmo principal: librería pública verificada por el motor (scripts/fixtures/cubzor-${kind}.json).`,
    `// Variantes: conjugaciones por U del principal y transcripciones de la lámina GAN que el motor`,
    `// confirma que resuelven ese mismo plantado. La imagen GAN se asigna por firma de última capa,`,
    `// no por número (GANCUBE numera los casos en su propio orden).`,
    `import type { CaseDef } from './types'`,
    ``,
    `export const ${kind.toUpperCase()}: CaseDef[] = [`,
    ...out.map((c) => `  ${JSON.stringify({ ...c, expect: kind })},`),
    `]`,
    ``,
  ].join('\n')
  writeFileSync(new URL(`../src/data/${kind}.ts`, import.meta.url), lines)
  console.log(`${kind.toUpperCase()}: ${out.length} casos · ${out.reduce((n, c) => n + c.algs.length, 0)} algoritmos · ${out.filter((c) => c.ref).length} con imagen GAN · sin imagen: ${noImage.length} (${noImage.slice(0, 8).join(', ')}${noImage.length > 8 ? '…' : ''})`)
}

build('oll')
build('pll')
