import { useMemo, useState } from 'react'
import { InteractiveCube } from '../components/InteractiveCube'
import { AlgText } from '../components/AlgoPlayer'
import { Star } from '../components/Controls'
import { STAGES, STAGE_ORDER, caseRefs, findCaseById } from '../data/stages'
import type { StageKey } from '../data/types'
import { caseState } from '../cube/engine'
import { fmtTime, progress, useAllProgress } from '../store/progress'
import { crossSolved } from '../cube/caseUtils'

type Tab = 'libre' | 'play' | 'cruces'

const TABS: { key: Tab; label: string }[] = [
  { key: 'libre', label: 'Cubo libre' },
  { key: 'play', label: 'Play-along' },
  { key: 'cruces', label: 'Solo cruces' },
]

const SESSION: Record<'full' | 'cross' | 'oll' | 'pll', string> = {
  full: 'sess:full',
  cross: 'sess:cross',
  oll: 'sess:oll',
  pll: 'sess:pll',
}

export default function Practice() {
  const [tab, setTab] = useState<Tab>('libre')
  return (
    <section className="page practice">
      <h1>Practicar con el cubo</h1>
      <p className="lead">
        Aquí el cubo se toca: arrastra una pegatina y su capa sigue el dedo. Los giros salen del cubo, no de la tabla.
      </p>
      <div className="row tabs">
        {TABS.map((t) => (
          <button key={t.key} className={t.key === tab ? 'btn tab on' : 'btn tab'} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'libre' && <FreeCube />}
      {tab === 'play' && <PlayAlong />}
      {tab === 'cruces' && <CrossDrill />}
    </section>
  )
}

function Records({ ids }: { ids: string[] }) {
  const all = useAllProgress()
  return (
    <div className="records">
      {ids.map((id) => {
        const e = all[id]
        const times = e?.times ?? []
        return (
          <div className="record" key={id}>
            <span className="muted">{id.replace('sess:', '').replace(':', ' ')}</span>
            <strong>{times.length}</strong>
            <span className="muted">
              {e?.best ? `mejor ${fmtTime(e.best)}` : 'sin tiempos'}
              {times.length > 2 ? ` · media ${fmtTime(times.reduce((a, b) => a + b, 0) / times.length)}` : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function FreeCube() {
  const [run, setRun] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [last, setLast] = useState<{ ms: number; moves: number } | null>(null)
  return (
    <div className="practice-grid">
      <div className="practice-cube">
        <InteractiveCube
          key={run}
          size={320}
          autoScramble
          onSolved={({ ms, moves }) => {
            progress.recordTime(SESSION.full, ms)
            setLast({ ms, moves })
          }}
          onMove={(l) => setLog((p) => [...p.slice(-40), l])}
        />
      </div>
      <aside className="practice-side">
        <h2>Cubo libre</h2>
        <p>
          Se planta con una remocida, tú le das con los dedos y el cronómetro para solo cuando el cubo queda resuelto.
          Sirve para acostumbrar la mano a los giros de capa antes de meter algoritmos.
        </p>
        {last && (
          <p className="callout">
            Último resolvido: {fmtTime(last.ms)} con {last.moves} giros
          </p>
        )}
        <Records ids={[SESSION.full]} />
        <button
          className="btn"
          onClick={() => {
            setRun(run + 1)
            setLog([])
            setLast(null)
          }}
        >
          nueva remocida
        </button>
        {log.length > 0 && (
          <p className="mono wrap">
            {log.join(' ')}
          </p>
        )}
      </aside>
    </div>
  )
}

function PlayAlong() {
  const [stage, setStage] = useState<StageKey>('oll')
  const [code, setCode] = useState<string | null>(null)
  const cases = useMemo(() => caseRefs(stage), [stage])
  const ref = code ? findCaseById(`${stage}:${code}`) : undefined
  const alg = ref?.def.algs[0] ?? ''
  const [run, setRun] = useState(0)
  return (
    <div className="practice-grid">
      <div className="practice-cube">
        {alg ? (
          <InteractiveCube
            key={`${stage}:${code}:${run}`}
            size={320}
            startState={caseState(alg)}
            target={alg}
            highlight={undefined}
            onSolved={({ ms }) => {
              progress.recordTime(`${ref?.id}:solve`, ms)
              progress.recordTime(`sess:${stage === 'f2l' ? 'par' : stage}`, ms)
            }}
          />
        ) : (
          <p className="hint">Elige un caso para plantarlo en el cubo.</p>
        )}
      </div>
      <aside className="practice-side">
        <h2>Play-along</h2>
        <p>
          Se planta el caso, se ve el algoritmo arriba y lo ejecutas en el cubo de verdad. La barra mide cuántos giros
          van coincidiendo con la fórmula; si te desvías, te avisa en el giro exacto.
        </p>
        <div className="row tabs">
          {STAGE_ORDER.map((k) => (
            <button key={k} className={k === stage ? 'btn tab on' : 'btn tab'} onClick={() => { setStage(k); setCode(null) }}>
              {STAGES[k].label}
            </button>
          ))}
        </div>
        <div className="chips">
          {cases.map((c) => (
            <button key={c.code} className={c.code === code ? 'chip on mono' : 'chip mono'} onClick={() => setCode(c.code)}>
              {c.code}
            </button>
          ))}
        </div>
        {ref && (
          <div className="case-play">
            <h3>
              {ref.def.code} · {ref.def.name} <Star id={ref.id} />
            </h3>
            <AlgText alg={alg} />
            {ref.def.short && <p className="muted">{ref.def.short}</p>}
            {!!ref.def.tips?.length && (
              <ul className="checks">
                {ref.def.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <p className="hint">
              Plantado = el cubo puesto en ese caso. Para volver a plantarlo, dale a «plantar» o a «nueva remocida».
            </p>
            <button className="btn" onClick={() => setRun(run + 1)}>
              volver a plantar
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function CrossDrill() {
  const [run, setRun] = useState(0)
  const [last, setLast] = useState<{ ms: number; moves: number } | null>(null)
  return (
    <div className="practice-grid">
      <div className="practice-cube">
        <InteractiveCube
          key={run}
          size={320}
          autoScramble
          onSolved={({ ms, moves }) => {
            progress.recordTime(SESSION.cross, ms)
            setLast({ ms, moves })
          }}
        />
      </div>
      <aside className="practice-side">
        <h2>Solo cruces</h2>
        <p>
          Planta con la cara blanca abajo y resuelve solo la cruz. Cronometra cada cruz: el objetivo del nivel 1 son 12
          giros o menos, y del nivel 3 salir mirando la cruz abajo sin girar el cubo.
        </p>
        {last && (
          <p className="callout">
            Última cruz: {fmtTime(last.ms)} con {last.moves} giros
          </p>
        )}
        <Records ids={[SESSION.cross]} />
        <button className="btn" onClick={() => setRun(run + 1)}>
          nueva remocida
        </button>
        <ul className="checks">
          <li>Hacer la cruz abajo, sin dar la vuelta al cubo al final.</li>
          <li>Prever el siguiente par de giros mientras haces el actual.</li>
          <li>Si una cruz te cuesta más de 12 giros, rehazla mirando solo la cara D.</li>
        </ul>
      </aside>
    </div>
  )
}
