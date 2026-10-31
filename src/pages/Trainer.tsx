import { useMemo, useState } from 'react'
import { caseRefs, STAGES, type CaseRef } from '../data/stages'
import type { StageKey } from '../data/types'
import { LevelBar, SolveTrainer, Star, StageProgress } from '../components/Controls'
import { AlgoPlayer } from '../components/AlgoPlayer'
import { applyMoves, caseState, cloneState, invertMoves, parseAlg, stateFromAlg, algToString } from '../cube/engine'
import { SLOT_LABEL, f2lPattern } from '../cube/caseUtils'
import { progress } from '../store/progress'

const TABS = [
  { key: 'cruces', label: 'Cruces', hint: 'Cruces completas con barajado real' },
  { key: 'par', label: 'Pares F2L', hint: 'Un par por vez, con el resto del cubo intacto' },
  { key: 'oll', label: 'OLL', hint: 'Caso plantado y ejecución repetida' },
  { key: 'pll', label: 'PLL', hint: 'Caso plantado y ejecución repetida' },
] as const

type Sub = (typeof TABS)[number]['key']

/**
 * Entrenador de casos: planta un caso al azar de la tabla y lo deja listo para
 * ejecutarlo. Con `1x` el cubo vuelve al plantado tras cada ejecución.
 */
function CaseTrainer({ stage }: { stage: StageKey }) {
  const refs = caseRefs(stage)
  const [i, setI] = useState(() => Math.floor(Math.random() * refs.length))
  const [reset, setReset] = useState(0)
  const ref: CaseRef = refs[i % refs.length]
  const start = useMemo(() => caseState(ref.def.algs[0]), [ref])

  return (
    <div className="split">
      <div className="panel player-panel">
        <AlgoPlayer
          key={`${ref.id}-${reset}`}
          alg={ref.def.algs[0]}
          startState={start}
          loops={1}
          primary
          explain
        />
        <p className="hint">
          El cubo arranca en el propio caso y termina resuelto. Pulsa «Repetir» para ejecutarlo otra vez desde el caso,
          sin rehacer el plantado a mano.
        </p>
        <div className="row">
          <button className="btn" onClick={() => setReset((r) => r + 1)}>
            Repetir
          </button>
          <button
            className="btn"
            onClick={() => {
              const next = (i + 1 + Math.floor(Math.random() * (refs.length - 1))) % refs.length
              setI(next)
              setReset((r) => r + 1)
            }}
          >
            Caso al azar
          </button>
          <a className="btn" href={`#/${ref.stage}/${ref.code}`}>
            Ver ficha del caso
          </a>
        </div>
      </div>
      <div className="panel">
        <h3>{ref.def.name}</h3>
        <p className="lead">{ref.def.short}</p>
        <LevelBar id={ref.id} />
        <p className="row">
          <Star id={ref.id} />
          <button className="btn" onClick={() => progress.setLevel(ref.id, 33)}>
            Marcar aprendido
          </button>
        </p>
        <StageProgress stage={stage} />
        <p className="hint">
          Los tiempos de la barra grande de la derecha se guardan en las últimas resoluciones; el nivel del algoritmo se
          guarda por algoritmo.
        </p>
      </div>
    </div>
  )
}

/** Entrenador de pares F2L: barajea solo el par (slot/orientación) y lo deja en la capa U. */
function PairTrainer() {
  const refs = caseRefs('f2l').filter((r) => r.def.expect === 'f2l-top')
  const [i, setI] = useState(0)
  const [reset, setReset] = useState(0)
  const ref = refs[i % refs.length]
  const start = useMemo(() => caseState(ref.def.algs[0]), [ref])
  const f = useMemo(() => {
    try {
      return f2lPattern(start)
    } catch {
      return null
    }
  }, [start])

  return (
    <div className="split">
      <div className="panel player-panel">
        <AlgoPlayer key={`${ref.id}-${reset}`} alg={ref.def.algs[0]} startState={start} loops={1} primary explain />
        <div className="row">
          <button className="btn" onClick={() => setReset((r) => r + 1)}>
            Repetir el par
          </button>
          <button
            className="btn"
            onClick={() => {
              setI((n) => (n + 1) % refs.length)
              setReset((r) => r + 1)
            }}
          >
            Otro par
          </button>
          <a className="btn" href={`#/f2l/${ref.code}`}>
            Ficha del caso
          </a>
        </div>
      </div>
      <div className="panel">
        <h3>
          {ref.def.name}
          {f && f.slot >= 0 ? ` · hueco ${SLOT_LABEL[f.slot]}` : ''}
        </h3>
        <p className="lead">
          Barajado del par: la esquina y la arista blancas arriba, el hueco libre. La fórmula termina con el par metido y
          el resto del cubo intacto: por eso se puede repetir sin tocar nada más.
        </p>
        <LevelBar id={ref.id} />
        <p className="row">
          <Star id={ref.id} />
          <a className="btn" href="#/entrenar/par">
            Con cronómetro
          </a>
        </p>
      </div>
    </div>
  )
}

export default function Trainer({ sub = 'cruces' }: { sub?: Sub }) {
  const tab = TABS.find((t) => t.key === sub) ?? TABS[0]
  const stageForTimer: 'cross' | 'par' | 'oll' | 'pll' = tab.key === 'cruces' ? 'cross' : tab.key === 'par' ? 'par' : tab.key

  return (
    <>
      <section className="hero">
        <h1>Entrenar</h1>
        <p className="lead">
          Cuatro entrenamientos separados: cruces a ojo, pares de F2L, y los casos de última capa plantados uno por uno.
          Con cronómetro de inspección de 15 segundos, como en la competición.
        </p>
        <div className="row chips">
          {TABS.map((t) => (
            <a key={t.key} className={`chip${t.key === tab.key ? ' on' : ''}`} href={`#/entrenar/${t.key}`}>
              {t.label}
            </a>
          ))}
        </div>
        <p className="hint">{tab.hint}</p>
      </section>

      {tab.key === 'cruces' && (
        <section>
          <SolveTrainer mode="cross" />
        </section>
      )}
      {tab.key === 'par' && (
        <>
          <section>
            <PairTrainer />
          </section>
          <section>
            <div className="section-head">
              <h2>Pares con cronómetro</h2>
              <span className="muted">barajado solo del par, un par por resolución</span>
            </div>
            <SolveTrainer mode="pair" />
          </section>
        </>
      )}
      {(tab.key === 'oll' || tab.key === 'pll') && (
        <>
          <section>
            <CaseTrainer stage={tab.key as StageKey} />
          </section>
          <section>
            <div className="section-head">
              <h2>{STAGES[tab.key].label} con cronómetro</h2>
              <span className="muted">resolución completa desde barajado</span>
            </div>
            <SolveTrainer mode="full" />
          </section>
        </>
      )}

      <section>
        <p className="hint">
          Nota: el cronómetro y los niveles se guardan en este navegador. Si cambias de dispositivo empieza tu progreso
          de cero (está previsto sincronizarlo más adelante).
        </p>
      </section>
    </>
  )
}

void [applyMoves, cloneState, invertMoves, parseAlg, stateFromAlg, algToString]
