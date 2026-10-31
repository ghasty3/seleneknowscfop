import { useMemo, useState } from 'react'
import { STAGES, STAGE_ORDER, allCaseRefs, type CaseRef } from '../data/stages'
import { LEVEL_HINT, LEVEL_LABEL, progress, useAllProgress } from '../store/progress'
import { CaseCard } from './StagePage'
import { NOTATION } from '../data/notation'

export default function Algs() {
  const all = useAllProgress()
  const [q, setQ] = useState('')
  const refs = allCaseRefs()

  const watch = refs.filter((r) => all[r.id]?.watched)
  const counts = { 0: 0, 33: 0, 66: 0, 100: 0 } as Record<0 | 33 | 66 | 100, number>
  for (const r of refs) {
    const lvl = all[r.id]?.level ?? 0
    counts[lvl as 0 | 33 | 66 | 100]++
  }

  const query = q.trim().toLowerCase()
  const results: CaseRef[] = useMemo(() => {
    if (!query) return []
    return refs.filter(
      (r) =>
        r.def.code.toLowerCase().includes(query) ||
        r.def.name.toLowerCase().includes(query) ||
        r.def.algs.some((a) => a.toLowerCase().includes(query)) ||
        (r.def.tips ?? []).some((t) => t.toLowerCase().includes(query)),
    )
  }, [query, refs])

  return (
    <>
      <section className="hero">
        <h1>Mis algoritmos</h1>
        <p className="lead">
          Los casos que marcaste con la estrella, el nivel que les diste y la búsqueda para encontrar cualquier fórmula de
          las tablas.
        </p>
        <input
          className="search"
          placeholder="buscar: Sune, A-1, R U R' U, OLL 21, hueco FR…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </section>

      <section>
        <div className="section-head">
          <h2>Estado de las tablas</h2>
          <span className="muted">{refs.length} algoritmos en total</span>
        </div>
        <div className="grid cols-4">
          {([0, 33, 66, 100] as const).map((l) => (
            <div className="panel center" key={l}>
              <span className="big-number">{counts[l]}</span>
              <p className="hint">{LEVEL_LABEL[l]}</p>
            </div>
          ))}
        </div>
        <div className="grid cols-2">
          {STAGE_ORDER.map((k) => {
            const list = refs.filter((r) => r.stage === k)
            const done = list.filter((r) => (all[r.id]?.level ?? 0) > 0).length
            return (
              <div className="panel" key={k}>
                <div className="card-top">
                  <span className="badge">{STAGES[k].label}</span>
                  <span className="muted">
                    {done} / {list.length}
                  </span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Mi lista</h2>
          <span className="muted">{watch.length} guardados</span>
        </div>
        {watch.length === 0 ? (
          <p className="lead">
            Todavía no has guardado ninguno. Pulsa la estrella en cualquier ficha para meterla aquí, y usa{' '}
            <a href="#/oll/2L-4">Sune</a> para empezar.
          </p>
        ) : (
          <div className="grid cols-4">
            {watch.map((r) => (
              <CaseCard key={r.id} r={r} />
            ))}
          </div>
        )}
        {watch.length > 0 && (
          <p className="row">
            <button className="btn" onClick={() => watch.forEach((r) => progress.setWatch(r.id, false))}>
              Vaciar la lista
            </button>
          </p>
        )}
      </section>

      {query && (
        <section>
          <div className="section-head">
            <h2>Resultados</h2>
            <span className="muted">
              {results.length} para «{q}»
            </span>
          </div>
          {results.length === 0 ? (
            <p className="lead">
              Sin coincidencias. Prueba con el código (A-1, 21, G3), con el nombre (Sune, T-Perm) o con un fragmento del
              algoritmo (R U R').
            </p>
          ) : (
            <div className="grid cols-4">
              {results.slice(0, 24).map((r) => (
                <CaseCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="section-head">
          <h2>Leyenda de niveles</h2>
        </div>
        <div className="grid cols-3">
          {([33, 66, 100] as const).map((l) => (
            <div className="panel" key={l}>
              <h3>{LEVEL_LABEL[l]}</h3>
              <p className="hint">{LEVEL_HINT[l]}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Notación rápida</h2>
          <a className="btn" href="#/notacion">
            Ver la guía completa
          </a>
        </div>
        <div className="sym-grid">
          {NOTATION.map((n) => (
            <span key={n.sym} className="sym" title={`${n.label} · ${n.desc}`}>
              <span className="sym-letter">{n.sym}</span>
              <span className="sym-label">{n.label}</span>
            </span>
          ))}
        </div>
      </section>
    </>
  )
}
