import { useState } from 'react'
import { NOTATION } from '../data/notation'
import { AlgoPlayer } from '../components/AlgoPlayer'
import { algToString, invertMoves, parseAlg } from '../cube/engine'

const KIND_LABEL: Record<string, string> = {
  cara: 'Caras',
  corte: 'Cortes centrales',
  ancha: 'Capas anchas',
  rotacion: 'Giros del cubo',
}

const KIND_LEAD: Record<string, string> = {
  cara: 'Las seis caras del cubo. La letra es un giro horario visto de frente a esa cara; el acento (’) es al revés; el 2 son 180°.',
  corte: 'Las tres capas del centro, que no se ven: M sigue a L, E sigue a D y S sigue a F. Son la clave de las cruces y de muchos OLL.',
  ancha: 'Llevan el giro de una cara exterior y de la capa central de ese mismo lado. Se escriben con minúscula o con w.',
  rotacion: 'Giran el cubo entero sin tocar ninguna pieza: sirven para mirar el caso desde el ángulo correcto sin cambiar la notación.',
}

const FINGER_LABEL: Record<string, string> = {
  azul: 'índice',
  rojo: 'pulgar',
  naranja: 'media',
}

const GROUPS = ['cara', 'corte', 'ancha', 'rotacion'] as const

export default function Notation() {
  const [demo, setDemo] = useState('R')
  const list = NOTATION.filter((n) => n.kind === demo)
  const sym = NOTATION.find((n) => n.sym === demo)

  return (
    <>
      <section className="hero">
        <h1>Notación: seis letras, una regla</h1>
        <p className="lead">
          Un algoritmo no es una cadena de letras: es una sucesión de caras que se leen igual en todo el mundo. Aquí cada
          símbolo se puede ver y ejecutar en el cubo.
        </p>
        <div className="row chips">
          {GROUPS.map((k) => (
            <button key={k} className={`chip${demo === k ? ' on' : ''}`} onClick={() => setDemo(k)}>
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="split">
          <div className="panel">
            <p className="lead">{KIND_LEAD[demo]}</p>
            <div className="sym-grid">
              {list.map((n) => (
                <button
                  key={n.sym}
                  className={`sym${n.sym === demo ? ' on' : ''}`}
                  onClick={() => setDemo(n.sym)}
                  title={n.label}
                >
                  <span className="sym-letter">{n.sym}</span>
                  <span className="sym-label">{n.label}</span>
                </button>
              ))}
            </div>
            <p className="hint">
              Regla general para todas: letra = giro horario visto de frente a esa cara. Añade <code className="mono">2</code>{' '}
              para 180°, <code className="mono">&apos;</code> para antihorario, <code className="mono">w</code> para capa
              ancha. Los giros de cubo se escriben x, y, z.
            </p>
            <div className="legend">
              {Object.entries(FINGER_LABEL).map(([k, v]) => (
                <span key={k} className={`finger finger-${k}`}>
                  {v}
                </span>
              ))}
              <span className="hint">dedo que empuja el giro, según la leyenda de GANCUBE</span>
            </div>
          </div>
          <div className="panel">
            <h3>
              {sym?.sym} · {sym?.label}
            </h3>
            <p>{sym?.desc}</p>
            {sym && (
              <>
                <p className="hint">
                  Demostración: el giro y su contrario, para que el cubo vuelva a estar resuelto. Pulsa cada letra para
                  verla en el cubo.
                </p>
                <AlgoPlayer
                  key={sym.sym}
                  alg={`${sym.sym} ${algToString(invertMoves(parseAlg(sym.sym)))}`}
                  primary
                  showCube
                  loops={2}
                  explain
                />
              </>
            )}
            <p className="row">
              <a className="btn" href="#/metodo">
                Verlo aplicado en el método
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
