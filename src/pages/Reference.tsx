import { useState } from 'react'
import { STAGES, STAGE_ORDER, caseRefs, type CaseRef } from '../data/stages'
import type { StageKey } from '../data/types'
import { useAllProgress } from '../store/progress'
import { EDGE_SHAPE_LABEL, PERM_LABEL, SLOT_LABEL, f2lPattern, ollPattern, pllPattern } from '../cube/caseUtils'
import { caseState } from '../cube/engine'

const TABS: { key: StageKey; label: string; lead: string }[] = [
  { key: 'cross', label: 'Cruz', lead: 'Los 6 ejercicios de cruz: la arista objetivo arriba y los otros tres brazos hechos.' },
  { key: 'f2l', label: 'F2L', lead: 'Los casos de la tabla de 21, clasificados por dónde está la pareja y cómo está el hueco.' },
  { key: 'oll', label: 'OLL', lead: 'El camino 2-Look primero, y los 57 casos agrupados por la forma que se ve en la cara amarilla.' },
  { key: 'pll', label: 'PLL', lead: 'Los 21 casos agrupados por lo que hay que permutar: esquinas, aristas o las dos cosas.' },
]

function signature(r: CaseRef): string {
  const st = caseState(r.def.algs[0])
  if (r.def.expect === 'oll') {
    const p = ollPattern(st)
    return `${EDGE_SHAPE_LABEL[p.edges]} · ${p.unorientedCorners} esq`
  }
  if (r.def.expect === 'pll') {
    const p = pllPattern(st)
    return `${PERM_LABEL[p.corners]} · ${PERM_LABEL[p.edges]}`
  }
  const f = f2lPattern(st)
  return f.slot >= 0 ? `${SLOT_LABEL[f.slot]} · ${f.slotState}` : '—'
}

export default function Reference({ tab }: { tab?: string }) {
  const all = useAllProgress()
  const active = TABS.find((t) => t.key === tab) ?? TABS[1]
  const refs = caseRefs(active.key)

  return (
    <>
      <section className="hero">
        <h1>Tablas de referencia</h1>
        <p className="lead">
          Las tablas, con la firma de cada caso calculada por el motor: qué patrón tiene plantado el cubo, sin confianza
          a mano. Cada fila enlaza con su ficha y su cubo.
        </p>
        <div className="row chips">
          {TABS.map((t) => (
            <a key={t.key} className={`chip${t.key === active.key ? ' on' : ''}`} href={`#/tablas/${t.key}`}>
              {t.label}
            </a>
          ))}
        </div>
        <p className="hint">{active.lead}</p>
      </section>

      <section>
        <div className="section-head">
          <h2>{STAGES[active.key].title}</h2>
          <span className="muted">
            {refs.filter((r) => (all[r.id]?.level ?? 0) > 0).length} de {refs.length} marcados
          </span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Caso</th>
              <th>Algoritmo</th>
              <th>Firma del patrón</th>
              <th>Nivel</th>
            </tr>
          </thead>
          <tbody>
            {refs.map((r) => (
              <tr key={r.id}>
                <td>
                  <a href={`#/${r.stage}/${r.code}`}>
                    <code className="mono">{r.def.code}</code>
                  </a>
                </td>
                <td>{r.def.name}</td>
                <td>
                  <code className="alg">{r.def.algs[0]}</code>
                </td>
                <td className="muted">{signature(r)}</td>
                <td>
                  {all[r.id]?.level ? (
                    <span className="chip on">{all[r.id]?.level === 33 ? 'Aprendido' : all[r.id]?.level === 66 ? 'Automático' : 'Fingertricks'}</span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <div className="section-head">
          <h2>Fuentes de las tablas</h2>
        </div>
        <ul className="tips">
          <li>
            GANCUBE · guía CFOP y tablas transcritas de sus imágenes:{' '}
            <code className="mono">gancube.com/pages/3x3x3-cfop-guide-gancube</code>
          </li>
          <li>
            Cubing Cube Codes · notación estándar de OLL y PLL:{' '}
            <code className="mono">cube.solutions/oll</code> · <code className="mono">cube.solutions/oll-2-look</code> ·{' '}
            <code className="mono">cube.solutions/pll</code>
          </li>
          <li>
            Jowston's Solutions · diagramas y notación de F2L:{' '}
            <code className="mono">jowston.com/rubik/advanced-corners.html</code>,{' '}
            <code className="mono">jowston.com/rubik/advanced-edges.html</code>
          </li>
          <li>
            Ruwix · diccionario de algoritmos (búsqueda de variantes más cortas): <code className="mono">ruwix.com</code>
          </li>
        </ul>
        <p className="hint">
          Las transcripciones en bruto están en <code className="mono">docs/fuentes.md</code> con la confianza de cada
          bloque. Los casos que generan el motor por simetría están marcados en su ficha.
        </p>
      </section>

      <section>
        <p className="row">
          <a className="btn primary" href={`#/${active.key}`}>
            Abrir {STAGES[active.key].label} en fichas con cubo
          </a>
          {STAGE_ORDER.filter((k) => k !== active.key).map((k) => (
            <a key={k} className="btn" href={`#/tablas/${k}`}>
              Tabla {STAGES[k].label}
            </a>
          ))}
        </p>
      </section>
    </>
  )
}
