import { useMemo, useState } from 'react'
import { Cube3D } from '../components/Cube3D'
import { LevelBar, Star } from '../components/Controls'
import { caseState, cloneState, mirrorAlg, parseAlg, applyMoves, scramble as makeScramble, type CubeState } from '../cube/engine'
import { STAGES, STAGE_ORDER, caseRefs, findCase, type CaseRef } from '../data/stages'
import type { StageKey } from '../data/types'

const PAIRS: Record<string, string> = {
  R: 'L',
  L: 'R',
  U: 'U',
  D: 'D',
  F: 'F',
  B: 'B',
  M: 'M',
  E: 'E',
  S: 'S',
  x: 'x',
  y: 'y',
  z: 'z',
}

/** Un giro en espejo: R' ↔ L, Rw ↔ Lw, M2 se queda M2. */
export function mirrorToken(token: string): string {
  const letter = token[0]
  const mods = token.slice(1)
  const base = PAIRS[letter] ?? letter
  const wide = mods.includes('w')
  const dir = mods.replace(/w/g, '')
  return base + (wide ? 'w' : '') + dir
}

/** Un algoritmo completo en espejo (palitos + cortes + giros). */
export function mirrorSequence(alg: string): string {
  return mirrorAlg(alg)
}

const ALGS: { name: string; alg: string }[] = [
  { name: 'Sune', alg: "R U R' U' R' F R F' U2" },
  { name: 'Antisune', alg: "F' R U R' U' R' F' R U2" },
  { name: 'Sexy move', alg: "R U R' U'" },
  { name: "T-Perm", alg: "R' L' U R U' R' L' R U R' L' R U' R' U L'" },
  { name: 'Barra → cruz', alg: "F R U R' U' F'" },
  { name: 'Corner insertion', alg: "R U' R' U' F' U F" },
]

function mirroredState(alg: string): CubeState {
  const s = caseState(alg)
  return s
}

export function MirrorCaseList() {
  const refs = STAGE_ORDER.flatMap((k) => caseRefs(k as StageKey))
  const pairs = refs.filter((r) => r.def.mirrorOf)
  return (
    <ul className="list-cases">
      {pairs.map((r) => {
        const mirror = r.def.mirrorOf ? findCase(r.def.mirrorOf.stage, r.def.mirrorOf.code) : undefined
        return (
          <li key={r.id}>
            <a href={`#/${r.stage}/${r.code}`}>{r.def.name}</a>
            {mirror && (
              <span className="muted">
                {' '}
                ↔ <a href={`#/${mirror.stage}/${mirror.code}`}>{mirror.def.name}</a>
              </span>
            )}
            {r.def.mirrorOf && !mirror && <span className="muted"> ↔ su pareja espejo no está en la tabla</span>}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Laboratorio de espejo: el mismo caso visto normal y espejado, un conversor de
 * algoritmos y la práctica con barajados espejados.
 */
export default function Mirror() {
  const [alg, setAlg] = useState("R U R' U' R' F R F' U2")
  const [scr, setScr] = useState('')
  const mirrored = useMemo(() => mirrorSequence(alg), [alg])
  const normal: CubeState = useMemo(() => mirroredState(alg), [alg])
  const espejo: CubeState = useMemo(() => mirroredState(mirrored), [mirrored])

  const practiceState: CubeState = useMemo(() => {
    const s = cloneState(caseState(''))
    if (scr) applyMoves(s, parseAlg(mirrorSequence(scr)))
    return s
  }, [scr])

  return (
    <div className="stack">
      <section className="section">
        <h1>Espejo</h1>
        <p className="lead">
          Adiestrar el lado izquierdo es lo que te hace bilingual: cuando te sale un caso espejado lo resuelves igual de
          rápido. Aquí el cubo de la derecha es el caso normal, y el de la izquierda es el mismo caso visto en espejo —
          fíjate que el patrón amarillo sale invertido.
        </p>
        <div className="mirror-grid">
          <div className="mirror-side">
            <Cube3D state={normal} size={200} />
            <p className="hint">normal · {alg}</p>
          </div>
          <div className="mirror-side">
            <Cube3D state={espejo} size={200} mirrored />
            <p className="hint">espejo · {mirrored}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Conversor de algoritmos</h2>
        <p className="lead">
          Escribe un algoritmo y obtén su gemelo exacto. El conversor intercambia R↔L (también los palitos anchos Rw↔Lw
          y los cortes M2), deja U, D, F, B y los giros de cubo en su sitio, e invierte el sentido de cada giro.
        </p>
        <label className="field">
          <span>Algoritmo</span>
          <input value={alg} onChange={(e) => setAlg(e.target.value)} placeholder="R U R' U'" spellCheck={false} />
        </label>
        <div className="grid cols-2">
          <div className="card">
            <h3>Algoritmo espejo</h3>
            <p className="mono">{mirrored}</p>
            <div className="row">
              <button
                className="btn"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(mirrored)
                  } catch {
                    /* sin clipboard */
                  }
                }}
              >
                Copiar espejo
              </button>
            </div>
            <p className="hint">
              Compruébalo: aplica el espejo sobre el cubo espejado (derecha) y el efecto es el mismo que el original sobre
              el cubo normal.
            </p>
          </div>
          <div className="card">
            <h3>Ejemplos famosos</h3>
            <ul className="list-cases">
              {ALGS.map((x) => (
                <li key={x.name} className="row-between">
                  <span>
                    {x.name} · <span className="mono">{x.alg}</span>
                  </span>
                  <button className="btn small" onClick={() => setAlg(x.alg)}>
                    usar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Práctica con barajado espejado</h2>
        <p className="lead">
          Pulsa «Barajear espejo»: el cubo de la izquierda está barajado en espejo, así que todos los casos que salgan
          piden el lado izquierdo. Gira las caras pulsando las pegatinas.
        </p>
        <div className="mirror-grid">
          <div className="mirror-side">
            <Cube3D state={practiceState} size={240} mirrored onFaceClick={() => undefined} />
            <p className="hint">cubo espejado · barajado espejo</p>
          </div>
          <div className="mirror-side card">
            <div className="scramble-box">
              <code className="scramble">{scr || 'pulsa barajear espejo'}</code>
              <div className="row">
                <button className="btn primary" onClick={() => setScr(mirrorSequence(makeScramble()))}>
                  Barajear espejo
                </button>
              </div>
            </div>
            <p className="hint">
              Si entrenas 10 minutos al día en espejo, en un par de semanas dejas de «girar el cubo para ver el caso» y lo
              reconoces de frente.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Parejas espejo en las tablas</h2>
        <p className="lead">
          Estos casos de OLL son pareja espejo de otro caso de la tabla: el patrón amarillo es el mismo, invertido. Si te
          sale uno de frente y su espejo te frena, entrena el par.
        </p>
        <MirrorCaseList />
        <p className="hint">
          Cada pareja se abre en su ficha de caso, donde tienes el reproductor del espejo, el nivel {`33 / 66 / 100`} y la
          lista de guardados.
        </p>
        <p className="row">
          {STAGE_ORDER.map((k) => (
            <a key={k} className="chip" href={`#/${k}`}>
              {STAGES[k].label}
            </a>
          ))}
        </p>
      </section>
    </div>
  )
}

export { STAGES, caseRefs }

/** Ficha compacta de un caso con su pareja espejo (usada por la página de espejo). */
export function MirrorCaseCard({ r }: { r: CaseRef }) {
  const mirror = r.def.mirrorOf ? findCase(r.def.mirrorOf.stage, r.def.mirrorOf.code) : undefined
  return (
    <div className="card">
      <div className="row-between">
        <h3>{r.def.name}</h3>
        <Star id={r.id} />
      </div>
      <p className="mono">{r.def.algs[0]}</p>
      <p className="hint">
        {mirror ? (
          <>
            espejo: <a href={`#/${mirror.stage}/${mirror.code}`}>{mirror.def.name}</a>
          </>
        ) : (
          'sin pareja espejo en la tabla'
        )}
      </p>
      <LevelBar id={r.id} compact />
    </div>
  )
}
