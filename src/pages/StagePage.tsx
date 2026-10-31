import { useMemo, useState } from 'react'
import { STAGES, caseRefs, type CaseRef } from '../data/stages'
import type { CaseDef, StageKey } from '../data/types'
import { useAllProgress, progress } from '../store/progress'
import { LevelBar, Star, StageProgress } from '../components/Controls'
import { CaseDiagram, caseMarkers, modeFor } from '../components/CaseDiagram'
import { caseState } from '../cube/engine'
import { canonicalView, EDGE_SHAPE_LABEL, PERM_LABEL, ollPattern, pllPattern } from '../cube/caseUtils'

/** Grupo del caso: el que declara la tabla, o el que calcula el motor a partir del patrón. */
export function groupOf(def: CaseDef): string {
  if (def.group) return def.group
  const st = canonicalView(def.algs[0]).state
  if (def.expect === 'oll') {
    const p = ollPattern(st)
    return `Aristas: ${EDGE_SHAPE_LABEL[p.edges]} · ${p.unorientedCorners} esquinas torcidas`
  }
  if (def.expect === 'pll') {
    const p = pllPattern(st)
    return `Esquinas: ${PERM_LABEL[p.corners]} · aristas: ${PERM_LABEL[p.edges]}`
  }
  return 'Pares'
}

export function CaseCard({ r }: { r: CaseRef }) {
  const st = useMemo(() => canonicalView(r.def.algs[0]).state, [r])
  return (
    <article className="card case-card">
      <a className="case-link" href={`#/${r.stage}/${r.code}`}>
        <CaseDiagram state={st} markers={caseMarkers(r.def, st)} mode={modeFor(r.def)} size={96} label={`Estado inicial de ${r.def.name}`} />
        <div className="case-meta">
          <h3>{r.def.name}</h3>
          <code className="alg">{r.def.algs[0]}</code>
        </div>
      </a>
      <div className="case-actions">
        <LevelBar id={r.id} compact />
        <Star id={r.id} />
      </div>
    </article>
  )
}

const TIP: Partial<Record<StageKey, string>> = {
  f2l: 'Cada caso está plantado con la pareja en la capa de arriba y su hueco libre. Fíjate en la esquina blanca, la arista blanca y el hueco marcado: son las tres cosas que hay que ver antes de tocar el cubo.',
  oll: 'Los casos empiezan por el camino 2-Look. En los diagramas están marcadas las aristas y las esquinas que hay que orientar.',
  pll: 'Aquí la última capa ya está orientada: lo único que cambia es el orden de las piezas. El diagrama marca las piezas fuera de su sitio.',
  cross: 'Ejercicios de cruz: la arista objetivo está arriba y los otros tres brazos ya cruzados abajo.',
}

export default function StagePage({ stage }: { stage: StageKey }) {
  const s = STAGES[stage]
  const refs = caseRefs(stage)
  const all = useAllProgress()
  const [filter, setFilter] = useState<'all' | 'watch' | 'pending'>('all')

  const shown = refs.filter((r) => {
    if (filter === 'watch') return all[r.id]?.watched
    if (filter === 'pending') return !(all[r.id]?.level ?? 0)
    return true
  })

  const groups = new Map<string, CaseRef[]>()
  for (const r of shown) {
    const g = groupOf(r.def)
    const arr = groups.get(g) ?? []
    arr.push(r)
    groups.set(g, arr)
  }

  return (
    <>
      <section className="hero">
        <span className="badge">{s.label}</span>
        <h1>{s.title}</h1>
        <p className="lead">{s.blurb}</p>
        {TIP[stage] && <p className="note">{TIP[stage]}</p>}
        <StageProgress stage={stage} />
        <div className="row chips">
          <button className={`chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
            Todos
          </button>
          <button className={`chip${filter === 'pending' ? ' on' : ''}`} onClick={() => setFilter('pending')}>
            Sin empezar
          </button>
          <button className={`chip${filter === 'watch' ? ' on' : ''}`} onClick={() => setFilter('watch')}>
            Mi lista
          </button>
          <button
            className="chip"
            onClick={() => {
              const first = shown.find((r) => !(all[r.id]?.level ?? 0)) ?? shown[0]
              if (first) window.location.hash = `#/${first.stage}/${first.code}`
            }}
          >
            Empezar el siguiente
          </button>
        </div>
      </section>

      {shown.length === 0 && (
        <section>
          <p className="lead">
            Nada por aquí todavía. Guarda casos con la estrella o quita el filtro para ver los {refs.length} algoritmos.
          </p>
          <button className="btn" onClick={() => setFilter('all')}>
            Ver todos
          </button>
        </section>
      )}

      {[...groups.entries()].map(([g, list]) => (
        <section key={g}>
          <div className="section-head">
            <h2>{g}</h2>
            <span className="muted">{list.length} casos</span>
          </div>
          <div className="grid cols-4">
            {list.map((r) => (
              <CaseCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      ))}

      <section>
        <p className="row">
          <a className="btn" href={`#/entrenar/${stage === 'cross' ? 'cruces' : stage === 'f2l' ? 'par' : stage}`}>
            Practicar {s.label.toLowerCase()} con cronómetro
          </a>
          <button
            className="btn"
            onClick={() => {
              for (const r of refs.slice(0, 5)) progress.setWatch(r.id, true)
            }}
          >
            Guardar los primeros 5 en mi lista
          </button>
        </p>
      </section>
    </>
  )
}
