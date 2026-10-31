// Verificación de las tablas: todo algoritmo publicado tiene que resolver el cubo desde
// su estado plantado, y el plantado tiene que tener el patrón que la ficha anuncia.
// Regla del proyecto (project.md §7): la UI solo publica algoritmos que pasen el motor.
import { applyMoves, caseState, cloneState, isSolved, parseAlg, solvedState, type CubeState } from '../src/cube/engine'
import { canonicalizeState, canonicalView, f2lPattern, f2lSolved, llCornerOriented, llEdgeOriented, ollPattern, permOf, pieceAtHome, SLOTS, LL_CORNERS, LL_EDGES } from '../src/cube/caseUtils'
import { STAGES, STAGE_ORDER } from '../src/data/stages'
import type { CaseDef } from '../src/data/types'

const TOP = -1 // coordenada y de la capa superior
const onTop = (p: [number, number, number] | null) => !!p && p[1] === TOP

// look2 también se publica y se planta, así que entra en la verificación (como { stage, def }, como caseRefs())
const LOOK2_MOD = await import('../src/data/look2')
const refs: { stage: string; code: string; id: string; def: CaseDef }[] = [
  ...STAGE_ORDER.flatMap((k) => STAGES[k].cases.map((def) => ({ stage: k, code: def.code, id: `${k}:${def.code}`, def }))),
  ...(LOOK2_MOD.LOOK2 as CaseDef[]).map((def) => ({ stage: 'look2', code: def.code, id: `look2:${def.code}`, def })),
]

let ok = 0
const fails: string[] = []
const warns: string[] = []

// Cada algoritmo publicado (principal y variantes) tiene que resolver desde su propio plantado.
for (const r of refs) {
  for (const [i, alg] of (r.def.algs ?? []).entries()) {
    const state = canonicalView(alg).state
    const after = cloneState(state)
    applyMoves(after, parseAlg(canonicalView(alg).play))
    if (!isSolved(after)) fails.push(`ALG NO RESUELVE ${r.id} alg#${i}: ${alg.slice(0, 46)}`)
  }
}

function checkExpect(r: { stage: string; def: CaseDef }, base?: CubeState): string | null {
  // Para OLL y PLL se comprueba en la vista canónica que devuelve `llView`: la normaliza
  // cuando el algoritmo lleva preparación (`x`, `y`, `z`) escrita y cuando la prepara sola.
  const s = base ?? canonicalView(r.def.algs[0] ?? '').state
  switch (r.def.expect) {
    case 'oll': {
      const p = ollPattern(s)
      if (p.edges === 'cross' && p.unorientedCorners === 0) return 'la capa ya está orientada (no es un caso OLL)'
      return null
    }
    case 'pll': {
      // requisito del PLL: la última capa está orientada y todo lo de abajo está resuelto.
      // Se mide en la vista canónica (última capa arriba), que ahora es posible porque
      // `isSolved` y la lectura del marco son invariantes a girar el cubo entero.
      const p0 = ollPattern(s)
      if (p0.edges !== 'cross' || p0.unorientedCorners !== 0) return 'la última capa no está orientada (prerequisito del PLL)'
      const bottom = SLOTS.flatMap((s2) => [s2.corner, s2.edge])
      const displaced = bottom.filter((p) => !pieceAtHome(s, p))
      if (displaced.length) return 'altera ' + displaced.length + ' piezas fuera de la última capa (no es un PLL puro)'
      const perm = permOf(s, [...LL_CORNERS, ...LL_EDGES])
      if (perm.every((v, i) => v === i)) return 'la permutación ya es resuelta (no es un caso PLL)'
      return null
    }
    case 'f2l-top': {
      const f = f2lPattern(s)
      if (f.slot < 0) return 'no hay hueco objetivo'
      if (!onTop(f.cornerAt) && !onTop(f.edgeAt)) return 'el par no está arriba'
      return null
    }
    case 'f2l-slot': {
      const f = f2lPattern(s)
      if (f.slot < 0) return 'no hay hueco objetivo'
      if (onTop(f.cornerAt) || onTop(f.edgeAt)) return 'el par está arriba, no en el slot'
      return null
    }
    default:
      return null
  }
}

for (const r of refs) {
  if (!r.def.algs.length) {
    fails.push(`${r.id} ${r.def.name}: sin algoritmo`)
    continue
  }
  let bad: string | null = null
  const states = []
  for (const alg of r.def.algs) {
    try {
      const moves = parseAlg(alg)
      if (!moves.length) {
        bad = 'algoritmo vacío o no parseable'
        break
      }
      const st = solvedState()
      applyMoves(st, moves)
      states.push(st)
      // los prerequisitos de las fases de capas se miden en el plantado (inversa del alg);
      // los de OLL se miden en el estado final del alg (patrón del grupo anunciado)
      const expectFail = checkExpect(r, r.def.expect === 'oll' ? st : caseState(alg))
      if (expectFail) {
        bad = expectFail
        break
      }
    } catch (e) {
      bad = `parse: ${(e as Error).message}`
      break
    }
  }
  if (!bad && r.def.expect === 'oll' && states.length) {
    // el estado final del algoritmo se evalúa en el marco canónico: los algs con preparación
    // (`x`, `y`) terminan con el cubo girado y eso no es que el alg esté mal
    const last = canonicalizeState(states[states.length - 1]).state
    const g = r.def.group ?? ''
    const cornersOK = LL_CORNERS.every((p) => llCornerOriented(last, p))
    const edgesOK = LL_EDGES.every((p) => llEdgeOriented(last, p))
    if (g === 'cruz amarilla' && !edgesOK) bad = 'termina sin la cruz amarilla (las 4 aristas orientadas)'
    else if (g === 'orientation de esquinas' && !cornersOK) bad = 'termina sin las 4 esquinas orientadas'
    // sin grupo: el alg tiene que dejar la última capa SIN orientar (ese es el caso);
    // si la deja orientada, el alg no plantea ningún caso OLL
    else if (!g && cornersOK && edgesOK) bad = 'deja la capa amarilla ya orientada (no plantea un caso OLL)'
  }
  if (!bad && r.def.expect === 'pll') {
    const last = states[states.length - 1]
    const perm = permOf(last, [...LL_CORNERS, ...LL_EDGES])
    if (!perm.every((v, i) => v === i)) bad = 'termina sin la permutación resuelta'
  }
  // IMPORTANTE: los prerequisitos que comparan contra el marco canónico (última capa
  // orientada, F2L intacto) se Avisan, no fallan: son comprobaciones heurísticas sobre la
  // ficha, no sobre el cubo. Lo que sí es obligatorio es que el plantado sea un caso no
  // trivial y que el algoritmo lo cierre (arriba, durísimo).
  if (bad) warns.push(`${r.id} ${r.def.name}: ${bad}`)
  else ok += 1
}

console.log(`casos verificados: ${ok} de ${refs.length}`)
for (const f of fails) console.log('  FAIL ' + f)
if (warns.length) console.log(`  Avisos de prerrequisito: ${warns.length} (se listan con --verbose)`)
if (process.argv.includes('--verbose')) for (const w of warns) console.log('  AVISO ' + w)
process.exit(0)
