import { useMemo, useState } from 'react'
import { Cube3D } from '../components/Cube3D'
import { caseState, cloneState, applyMoves, parseAlg, scramble as makeScramble, solvedState } from '../cube/engine'
import { LL_CORNERS, LL_EDGES, PERM_LABEL, permOf } from '../cube/caseUtils'
import { caseRefs } from '../data/stages'

const RING = [...LL_CORNERS, ...LL_EDGES]

function edgeShape(a: number, b: number): string {
  const rel = ((b - a) % 4 + 4) % 4
  if (rel === 0) return 'resuelto'
  if (rel === 2) return 'opuestos'
  return rel === 1 ? 'adyacentes' : 'adyacentes'
}

/** Tablero de reloj: las 12 piezas del anillo, con la posición de casa y la real. */
export function ClockBoard({ seed = 1 }: { seed?: number }) {
  const state = useMemo(() => {
    const s = solvedState()
    // barajado del anillo: conmutador de dos aristas adyacentes repetido
    const algs = caseRefs('pll')
      .map((r) => r.def.algs[0])
      .filter((a) => !!a)
      .slice(0, 12)
    const pick = algs[seed % algs.length]
    applyMoves(s, parseAlg(pick))
    return s
  }, [seed])

  const perm = permOf(state, RING)
  const homeName = (p: [number, number, number]) => {
    const idx = RING.findIndex((q) => q[0] === p[0] && q[1] === p[1] && q[2] === p[2])
    return idx < 4 ? `esquina ${idx + 1}` : `arista ${idx - 3}`
  }

  return (
    <div className="stack">
      <div className="grid cols-2">
        <div className="card">
          <h3>Barajado del anillo</h3>
          <Cube3D state={state} size={210} />
          <p className="hint">
            Las 12 piezas de la última capa (4 esquinas + 4 aristas) permutadas, con las dos primeras capas resueltas: así
            empieza una resolución de Rubik's Clock.
          </p>
        </div>
        <div className="card">
          <h3>Qué pieza está en casa</h3>
          <table className="table">
            <thead>
              <tr>
                <th>posición de casa</th>
                <th>pieza que hay ahí</th>
                <th>estado</th>
              </tr>
            </thead>
            <tbody>
              {RING.map((p, i) => {
                const at = perm[i]
                return (
                  <tr key={String(p)}>
                    <td>{homeName(p)}</td>
                    <td>{homeName(RING[at])}</td>
                    <td>{at === i ? 'en casa' : 'fuera'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="hint">
            En Clock solo te mueves por el anillo: la pieza que toca el clippity-cloppity de la cara frontal es la que
            cambia cuando giras ese dial. Por eso se entrena igual que un PLL.
          </p>
        </div>
      </div>
      <div className="card">
        <h3>Conmutador: qué hace cada movimiento</h3>
        <ul className="list-cases">
          <li>
            Un dial en la <strong>esquina</strong> gira esa esquina y las <strong>dos aristas que la tocan</strong> por
            detrás (sentido horario).
          </li>
          <li>
            Un dial en la <strong>arista</strong> gira esa arista y las <strong>4 esquinas más cercanas</strong> (sentido
            horario).
          </li>
          <li>
            El central gira las <strong>4 aristas</strong>. Con N el dial gira N veces, sin N una vez.
          </li>
          <li>
            Los dos puntos sobre una pieza significan girar el clip de esa cara: eso cambia si el dial afecta al anillo{' '}
            <em>interior</em> o al <em>exterior</em> (lado frontal / trasero de la pieza).
          </li>
        </ul>
        <p className="hint">
          Por eso el método es exactamente la lógica PLL: dejar cada pieza en su sitio con conmutadores. Un conmutador
          puro deja solo dos piezas tocadas; si te quedan dos aristas <em>opuestas</em>, repites el mismo conmutador dos
          veces; si son <em>adyacentes</em>, lo montas con tres conmutadores.
        </p>
      </div>
      <div className="card">
        <h3>Lado frontal y trasero</h3>
        <p className="lead">
          Cada pieza tiene dos lados. Los puntos sobre la pegatina eligen qué lado de la pieza se mueve: por eso la misma
          secuencia resuelve el anillo de un lado y del otro, y por eso Clock se parece a resolver un PLL dos veces.
        </p>
        <p className="hint">
          En el método de speedsolving la ruta es: cruz → F2L → OLL → PLL, con conmutadores para dejar las 12 piezas en su
          sitio. Para cronometrar compites con el anillo de un lado y luego con el del otro, con la cara oculta preparada
          antes de inspección.
        </p>
      </div>
    </div>
  )
}

const STEPS: { title: string; text: string }[] = [
  {
    title: '1 · Lado frontal',
    text: 'Resuelves las 12 piezas del anillo frontal con conmutadores. Cuando el frontal queda resuelto, miras la cara oculta (empuñaduras) y anotas el barajado de los puntos.',
  },
  {
    title: '2 · Cara oculta',
    text: 'Barajas los puntos de la cara trasera: ahí queda la segunda parte. En competición se inspeccionan 10 minutos antes de la resolución.',
  },
  {
    title: '3 · Anillo trasero',
    text: 'Mismo método, piezas del anillo trasero. Las fórmulas son las mismas, con los lados cambiados: por eso se entrena como un PLL.',
  },
  {
    title: '4 · Empuñaduras',
    text: 'Las 4 empuñaduras se resuelven por conmutadores de 3 ruedas. Se entrenan aparte, igual que los casos de PLL.',
  },
]

/** Método de Rubik's Clock explicado con lógica de última capa. */
export default function Clock() {
  const [seed, setSeed] = useState(1)
  const counts = useMemo(() => {
    const s = caseState("R U R' U' R' F R F' U2")
    return { corners: LL_CORNERS.length, edges: LL_EDGES.length, state: s }
  }, [])
  return (
    <div className="stack">
      <section className="section">
        <h1>Rubik's Clock</h1>
        <p className="lead">
          El Clock es un cubo de piezas que se mueven por un anillo con 14 ruedas. El método de speedsolving es el mismo
          cerebro que la última capa del CFOP: conmutadores que dejan cada pieza en su sitio. Aquí lo verás con un tablero
          de anillo y un tablero de puntos.
        </p>
        <p className="hint">
          Piezas del anillo: {counts.corners} esquinas + {counts.edges} aristas = 12 por lado. Las 4 empuñaduras se
          resuelven al final con conmutadores de 3 ruedas.
        </p>
      </section>

      <section className="section">
        <h2>Las cuatro fases</h2>
        <div className="grid cols-2">
          {STEPS.map((s) => (
            <article key={s.title} className="card">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Tablero de anillo</h2>
          <div className="row">
            <button className="btn small" onClick={() => setSeed((s) => s + 1)}>
              otro barajado
            </button>
          </div>
        </div>
        <ClockBoard seed={seed} />
      </section>

      <section className="section">
        <h2>Tablero de puntos</h2>
        <p className="lead">
          Los puntos son la otra mitad del barajado: sobre una pieza, un punto = clip de ese dial en sentido horario, dos
          puntos = antihorario. Se anotan como una rejilla de 3×3 que coincide con la posición de las ruedas, y el centro
          son los dos puntos centrales.
        </p>
        <p className="hint">
          En la ficha de notación de Clock se ve la rejilla: arriba las piezas del anillo de arriba, abajo el anillo
          inferior, izquierda y derecha los anillos laterales, centro la cruz de aristas. Los números al lado son N.
        </p>
        <div className="clock-grid">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className={`clock-cell${i === 4 ? ' center' : ''}`}>
              <span>{i === 4 ? '·' : ''}</span>
            </div>
          ))}
        </div>
        <p className="hint">
          Ejemplo: <span className="mono">**2· 4· ·3· ·5· 2**</span> es una ronda de puntos. Se memoriza como un caso de
          PLL: patrón → fórmula.
        </p>
      </section>

      <section className="section">
        <h2>Conmutadores, en tu lenguaje</h2>
        <table className="table">
          <thead>
            <tr>
              <th>si te quedan…</th>
              <th>haz…</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>dos aristas <strong>adyacentes</strong> del anillo</td>
              <td>conmutador de 3 conmutadores (se monta como un T-Perm de Clock)</td>
            </tr>
            <tr>
              <td>dos aristas <strong>opuestas</strong></td>
              <td>el mismo conmutador dos veces</td>
            </tr>
            <tr>
              <td>dos esquinas adyacentes</td>
              <td>conmutador de esquina + arista, repetido por el lado que toque</td>
            </tr>
            <tr>
              <td>todo el anillo menos las empuñaduras</td>
              <td>empuñaduras: conmutador de 3 ruedas por empuñadura, 4 veces</td>
            </tr>
          </tbody>
        </table>
        <p className="hint">
          Se dice igual que en la última capa del cubo: {PERM_LABEL.cycle3} de aristas, {PERM_LABEL.adj}, {PERM_LABEL.diag} y{' '}
          {PERM_LABEL.swap2o} — y se entrena igual, por casos, hasta que sale solo.
        </p>
      </section>
    </div>
  )
}
