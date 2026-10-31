import { STAGES, STAGE_ORDER, caseRefs } from '../data/stages'
import { LOOK2 } from '../data/look2'
import { useAllProgress } from '../store/progress'
import { StageProgress } from '../components/Controls'
import { CaseDiagram, caseMarkers } from '../components/CaseDiagram'
import { caseState } from '../cube/engine'

export function NotFound() {
  return (
    <section className="hero">
      <h1>No encontramos esa página</h1>
      <p className="lead">
        Vuelve al <a href="#/">inicio</a> o salta a una fase:{' '}
        {STAGE_ORDER.map((k, i) => (
          <span key={k}>
            {i > 0 && ', '}
            <a href={`#/${k}`}>{STAGES[k].label}</a>
          </span>
        ))}
        .
      </p>
    </section>
  )
}

export default function Home() {
  const all = useAllProgress()
  const watch = caseRefs('oll')
    .concat(caseRefs('f2l'), caseRefs('pll'), caseRefs('cross'))
    .filter((r) => all[r.id]?.watched)

  return (
    <>
      <section className="hero">
        <h1>Aprende CFOP viendo cómo se mueve el cubo</h1>
        <p className="lead">
          Cada algoritmo viene con un cubo 3D que lo ejecuta movimiento a movimiento, empezando desde el propio caso. Al
          final del último giro el cubo está resuelto: así se aprenden los algoritmos, entendiéndolos.
        </p>
        <div className="row">
          <a className="btn primary" href="#/f2l">
            Empezar por el F2L
          </a>
          <a className="btn" href="#/metodo">
            Ver el método completo
          </a>
          <a className="btn" href="#/entrenar/par">
            Entrenar con cronómetro
          </a>
        </div>
      </section>

      <section>
        <h2>Las cuatro fases, en orden</h2>
        <p className="lead">Siempre se resuelven igual: cruz, dos capas, orientación, permutación.</p>
        <div className="grid cols-2">
          {STAGE_ORDER.map((k) => {
            const s = STAGES[k]
            return (
              <a key={k} className="card stage-card" href={`#/${k}`}>
                <div className="card-top">
                  <span className="badge">{s.label}</span>
                  <span className="muted">{s.cases.length} algoritmos</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
                <StageProgress stage={k} />
              </a>
            )
          })}
        </div>
      </section>

      <section>
        <h2>Empieza por aquí: 2-Look</h2>
        <p className="lead">
          Con el camino corto de la última capa resuelves cualquier OLL: primero la cruz amarilla (3 casos) y después la
          orientación de las esquinas con Sune y Antisune. Son la versión reducida de la tabla de 57: apréndelas y la
          tabla grande se entiende sola.
        </p>
        <div className="grid cols-4">
          {LOOK2.map((c) => {
            const st = caseState(c.algs[0])
            return (
              <a key={c.code} className="card case-card" href={`#/oll/${c.code}`}>
                <CaseDiagram state={st} markers={caseMarkers(c, st)} size={104} />
                <div className="case-meta">
                  <h3>{c.name}</h3>
                  <code className="alg">{c.algs[0]}</code>
                </div>
              </a>
            )
          })}
        </div>
        <p className="row">
          <a className="btn" href="#/oll">
            Ver todos los OLL
          </a>
        </p>
      </section>

      <section>
        <h2>Antes de nada: la notación</h2>
        <p className="lead">
          Seis letras y tres letras más (cortes y giros). Si entiendes R, U, M y x ya puedes leer cualquier algoritmo de
          esta web, y tocarlo en el cubo.
        </p>
        <p className="row">
          <a className="btn" href="#/notacion">
            Aprender la notación
          </a>
        </p>
      </section>

      {watch.length > 0 && (
        <section>
          <h2>Mi lista de algoritmos</h2>
          <p className="lead">Los que guardaste con la estrella, para repasar hoy.</p>
          <div className="grid cols-4">
            {watch.slice(0, 8).map((r) => {
              const st = caseState(r.def.algs[0])
              return (
                <a key={r.id} className="card case-card" href={`#/${r.stage}/${r.code}`}>
                  <CaseDiagram state={st} markers={caseMarkers(r.def, st)} size={104} />
                  <div className="case-meta">
                    <h3>{r.def.name}</h3>
                    <code className="alg">{r.def.algs[0]}</code>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
