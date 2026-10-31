import { useMemo, useState } from 'react'
import { STAGES, findCase, neighbors, caseRefs } from '../data/stages'
import type { StageKey } from '../data/types'
import { LEVEL_HINT, useProgress } from '../store/progress'
import { LevelBar, Star } from '../components/Controls'
import { AlgoPlayer, notationLegend } from '../components/AlgoPlayer'
import { CaseDiagram, caseMarkers } from '../components/CaseDiagram'
import { Chevron } from '../components/icons'
import { caseState, cloneState, parseAlg, applyMoves } from '../cube/engine'
import { EDGE_SHAPE_LABEL, PERM_LABEL, SLOT_LABEL, f2lPattern, ollPattern, pllPattern } from '../cube/caseUtils'
import { groupOf, CaseCard } from './StagePage'
import { NotFound } from './Home'

const SETUP_LABEL: Record<string, string> = {
  U: 'media delantera',
  "U'": 'media trasera',
  U2: 'media trasera',
  y: 'cubo a la izquierda',
  "y'": 'cubo a la derecha',
  x2: 'cubo volcado',
}

/** Setups seguros: no cambian el patrón del caso, solo el ángulo de ataque. */
const SETUPS = ['U', "U'", 'U2', 'y', "y'", 'x2']

export default function CaseDetail({ stage, code }: { stage: StageKey; code: string }) {
  const ref = findCase(stage, code)
  const p = useProgress(ref?.id ?? '')
  const [mirrored, setMirrored] = useState(false)
  const [loops, setLoops] = useState(2)
  const [setup, setSetup] = useState<string[]>([])

  const def = ref?.def
  const base = useMemo(() => (def ? caseState(def.algs[0]) : null), [def])
  const state = useMemo(() => {
    if (!base) return null
    const s = cloneState(base)
    applyMoves(s, parseAlg(setup.join(' ')))
    return s
  }, [base, setup])

  if (!ref || !def || !state) return <NotFound />
  const { prev, next } = neighbors(ref)
  const family = caseRefs(stage).filter((r) => groupOf(r.def) === groupOf(def) && r.id !== ref.id)

  const hints: string[] = []
  let patternLine = ''
  if (def.expect === 'oll') {
    const o = ollPattern(state)
    patternLine = `Armas: ${EDGE_SHAPE_LABEL[o.edges]} · ${o.unorientedCorners} esquinas sin orientar · ${o.flipped} aristas sin orientar`
    hints.push('Mira primero la forma de las aristas amarillas: punto, L o barra.')
    if (o.edges !== 'cross') hints.push('Con la cruz amarilla sin hacer, la fórmula de esquinas no cierra: empieza por la cruz.')
    if (o.unorientedCorners === 3) hints.push('Con la cruz hecha, deja la esquina amarilla ya orientada detrás a la derecha y aplica Sune.')
    if (def.tips) hints.push(...def.tips)
  } else if (def.expect === 'pll') {
    const q = pllPattern(state)
    patternLine = `Permutación: ${PERM_LABEL[q.corners]} en esquinas · ${PERM_LABEL[q.edges]} en aristas · ${q.headlights} faros`
    hints.push('Busca una arista resuelta: es la pista para colocar las 4 esquinas.')
    if (q.headlights >= 1) hints.push('El lado con la arista resuelta va mirándote al empezar.')
    if (def.tips) hints.push(...def.tips)
  } else {
    const f = f2lPattern(state)
    patternLine = f.slot >= 0 ? `Hueco objetivo: ${SLOT_LABEL[f.slot]} · estado del hueco: ${f.slotState}` : 'Par blanco sin hueco reconocido'
    hints.push('La esquina blanca y la arista blanca van juntas antes de meter: empareja, y luego entra por la puerta.')
    if (f.slotState === 'bloqueado') hints.push('El hueco está bloqueado por piezas ajenas: saca primero lo que sobra.')
    if (f.slotState === 'torcido') hints.push('La pareja ya está dentro, mal orientada: sácala con la misma secuencia al revés.')
    if (def.tips) hints.push(...def.tips)
  }

  return (
    <>
      <nav className="crumb">
        <a href="#/">Inicio</a> <span>/</span> <a href={`#/${stage}`}>{STAGES[stage].label}</a> <span>/</span>{' '}
        <span>{def.name}</span>
      </nav>

      <section className="hero">
        <h1>
          <span className="badge">{def.code}</span> {def.name}
        </h1>
        <p className="lead">{def.short ?? STAGES[stage].blurb}</p>
        <p className="note">{patternLine}</p>
      </section>

      <div className="detail">
        <div className="side">
          <div className="panel">
            <h3>Qué mirar</h3>
            <ul className="tips">
              {hints.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <div className="center">
              <CaseDiagram state={state} markers={caseMarkers(def, state)} size={150} label="Diagrama del caso" />
            </div>
            {def.ref && (
              <figure className="ref-fig">
                <img className="ref-img" src={def.ref} alt={`Casilla oficial de ${def.name} en la lámina GANCUBE`} loading="lazy" />
                <figcaption>
                  Casilla oficial de la lámina GANCUBE · el número de GAN no coincide con la numeración estándar: la imagen se empareja por patrón de última capa
                </figcaption>
              </figure>
            )}
          </div>

          <div className="panel">
            <h3>Nivel</h3>
            <LevelBar id={ref.id} />
            <p className="hint">{LEVEL_HINT[p.level]}</p>
            <p className="row">
              <Star id={ref.id} />
              <a className="btn" href={`#/entrenar/${stage === 'cross' ? 'cruces' : stage === 'f2l' ? 'par' : stage}`}>
                Practicar con cronómetro
              </a>
            </p>
          </div>

          <div className="panel">
            <details>
              <summary>Por qué este algoritmo cierra</summary>
              <p className="hint">
                {def.mirrorOf
                  ? `Está generado por simetría desde ${def.mirrorOf.code}: el motor aplicó el espejo R↔L sobre el caso original y la verificación comprueba que plantado + algoritmo = cubo resuelto.`
                  : 'El plantado deja el caso exacto que describe la tabla. Al final del último giro el cubo queda resuelto, y por eso el reproductor puede dar vueltas seguidas sin rehacer el plantado.'}
              </p>
              <p className="hint notation-legend">
                {notationLegend(def.algs[0]).map((x) => (
                  <span key={x.label} className={`chip-fam ${x.cls}`}>
                    {x.label}
                  </span>
                ))}
              </p>
            </details>
          </div>

          {def.algs.length > 1 && (
            <section>
              <div className="section-head">
                <h2>Alternativas</h2>
                <span className="muted">elige la que te salga con un solo dedo</span>
              </div>
              <div className="grid cols-2">
                {def.algs.map((a, i) => (
                  <div className="panel" key={i}>
                    <AlgoPlayer alg={a} startState={base ? cloneState(base) : undefined} loops={1} mirrored={mirrored} explain />
                  </div>
                ))}
              </div>
            </section>
          )}

          {family.length > 0 && (
            <section>
              <div className="section-head">
                <h2>Del mismo grupo</h2>
                <span className="muted">{groupOf(def)}</span>
              </div>
              <div className="grid cols-4">
                {family.slice(0, 4).map((r) => (
                  <CaseCard key={r.id} r={r} />
                ))}
              </div>
            </section>
          )}

          <div className="row">
            {prev && (
              <a className="btn" href={`#/${prev.stage}/${prev.code}`}>
                <Chevron dir="left" />
                {prev.def.name}
              </a>
            )}
            {next && (
              <a className="btn primary" href={`#/${next.stage}/${next.code}`}>
                {next.def.name}
                <Chevron dir="right" />
              </a>
            )}
          </div>
        </div>

        <div className="detail-rail">
          <div className="panel player-panel">
            <AlgoPlayer
              key={`${ref.id}-${mirrored}-${setup.join('')}`}
              alg={def.algs[0]}
              startState={state}
              mirrored={mirrored}
              loops={loops}
              primary
              explain
            />
            <div className="row chips">
              <button className="chip" onClick={() => setSetup([])} disabled={setup.length === 0}>
                Quitar setup
              </button>
              {SETUPS.map((s) => (
                <button
                  key={s}
                  className={`chip${setup.includes(s) ? ' on' : ''}`}
                  onClick={() => setSetup((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
                  title={`Giro de cubo ${SETUP_LABEL[s] ?? s}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="row chips">
              <button className={`chip${!mirrored ? ' on' : ''}`} onClick={() => setMirrored(false)}>
                Normal
              </button>
              <button className={`chip${mirrored ? ' on' : ''}`} onClick={() => setMirrored(true)}>
                Espejo
              </button>
              {[1, 2, 4].map((n) => (
                <button key={n} className={`chip${loops === n ? ' on' : ''}`} onClick={() => setLoops(n)}>
                  {n === 1 ? '1 vez' : `${n} veces`}
                </button>
              ))}
            </div>
            <p className="hint">
              Los chips de setup giran el cubo entero sin tocar las piezas: atacan el caso desde el ángulo cómodo. Modo
              1x: el cubo queda plantado en el caso tras una ejecución, para ensayar el fingertrick sin rehacer el plantado.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
