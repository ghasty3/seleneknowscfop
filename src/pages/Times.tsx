import { useMemo } from 'react'
import { useAllProgress, fmtTime, LEVEL_LABEL, type Level } from '../store/progress'
import { findCase } from '../data/stages'
import type { StageKey } from '../data/types'

const SESSION_LABEL: Record<string, string> = {
  'timer:cross': 'Cruces',
  'timer:f2l': 'Pares de F2L',
  'timer:full': 'Resolución completa',
  'timer:oll': 'OLL',
  'timer:pll': 'PLL',
}

const LEVELS: Level[] = [0, 33, 66, 100]

/** Panel de progreso y tiempos guardados en este navegador. */
export default function Times() {
  const all = useAllProgress()
  const rows = useMemo(() => Object.entries(all).filter(([id]) => !id.startsWith('timer:')), [all])
  const sessions = useMemo(() => Object.entries(all).filter(([id]) => id.startsWith('timer:')), [all])

  const counts = useMemo(() => {
    const c: Record<Level, number> = { 0: 0, 33: 0, 66: 0, 100: 0 }
    for (const [, e] of rows) c[e.level] += 1
    return c
  }, [rows])

  const watched = rows.filter(([, e]) => e.watched)

  return (
    <div className="stack">
      <section className="section">
        <h1>Tiempos y progreso</h1>
        <p className="lead">
          Todo se guarda solo en este navegador: no hay cuentas. Si borras los datos del sitio, el progreso desaparece.
        </p>
        <div className="grid cols-4">
          {LEVELS.map((l) => (
            <div key={l} className="card">
              <h3>{LEVEL_LABEL[l]}</h3>
              <p className="big">{counts[l]}</p>
              <p className="hint">algoritmos</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Sesiones de cronómetro</h2>
        {sessions.length === 0 && <p className="hint">Aún no has usado el cronómetro. Empieza en el Entrenador.</p>}
        {sessions.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>modo</th>
                <th>resoluciones</th>
                <th>mejor</th>
                <th>media</th>
                <th>última</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(([id, e]) => (
                <tr key={id}>
                  <td>{SESSION_LABEL[id] ?? id}</td>
                  <td>{e.times.length}</td>
                  <td>{e.best ? fmtTime(e.best) : '—'}</td>
                  <td>{e.times.length ? fmtTime(e.times.reduce((a, b) => a + b, 0) / e.times.length) : '—'}</td>
                  <td>{e.times.length ? fmtTime(e.times[e.times.length - 1]) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <h2>My List ({watched.length})</h2>
        {watched.length === 0 && <p className="hint">Marca algoritmos con la estrella para tener tu propia lista.</p>}
        {watched.length > 0 && (
          <ul className="list-cases">
            {watched.map(([id, e]) => {
              const [stage, code] = id.split(':')
              const ref = findCase(stage as StageKey, code)
              return (
                <li key={id}>
                  <a href={`#/${stage}/${code}`}>{ref ? ref.def.name : id}</a>
                  <span className="muted"> · {LEVEL_LABEL[e.level]}</span>
                  {e.best ? <span className="muted"> · mejor {fmtTime(e.best)}</span> : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="section">
        <h2>Algoritmos con nivel</h2>
        {rows.length === 0 && <p className="hint">Aún no has marcado ningún algoritmo.</p>}
        {rows.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>algoritmo</th>
                <th>nivel</th>
                <th>lista</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .slice()
                .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
                .map(([id, e]) => {
                  const [stage, code] = id.split(':')
                  const ref = findCase(stage as StageKey, code)
                  return (
                    <tr key={id}>
                      <td>
                        <a href={`#/${stage}/${code}`}>{ref ? ref.def.name : id}</a>
                      </td>
                      <td>{LEVEL_LABEL[e.level]}</td>
                      <td>{e.watched ? '★' : ''}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
