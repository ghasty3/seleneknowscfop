import { STAGES, STAGE_ORDER, caseRefs } from '../data/stages'
import type { StageKey } from '../data/types'
import { StageProgress } from '../components/Controls'
import { CaseDiagram, modeFor } from '../components/CaseDiagram'
import { caseState, isSolved, solvedState, applyMoves, parseAlg, cloneState } from '../cube/engine'

const GUIDE: Record<StageKey, { goal: string; steps: string[]; why: string; mistake: string; algDemo: string }> = {
  cross: {
    goal: 'Cruzar las 4 aristas blancas en la cara de abajo, con los colores laterales alineados con los centros.',
    steps: [
      'Sujeta el cubo con la cara blanca abajo y los centros de referencia delante.',
      'Busca una arista blanca y resuélvela en 2 o 3 movimientos, sin girar la cara D más de lo necesario.',
      'Comprueba siempre el color lateral de cada brazo: la cruz no está hecha si un brazo no encaja con su centro.',
    ],
    why: 'La cruz es el único paso del CFOP que se hace a ojo: entrena la lectura del cubo y te da una base fija desde la que pensar los pares.',
    mistake: 'Hacer la cruz y descubrir después que un brazo no encaja: se soluciona planificando la última arista.',
    algDemo: "F' R' U' F2",
  },
  f2l: {
    goal: 'Meter los 4 pares esquina + arista en sus huecos, de uno en uno, sin desmontar lo resuelto.',
    steps: [
      'Localiza la esquina blanca y la arista que le corresponde (coinciden los dos colores laterales).',
      'Empareja las dos piezas antes de meterlas: déjalas pegadas en la capa de arriba, lista para entrar en su hueco.',
      'Meter el par por la puerta de su hueco con la secuencia estándar: sacar la esquina, colocar la arista, volver a cerrar.',
      'Si el par ya está dentro del hueco torcido, sacarlo con la misma secuencia al revés y volver a meterlo bien.',
    ],
    why: 'Este es el paso que más tiempo consume a todos: por eso se entrena caso por caso. Con los 21 casos reconocidos de memoria el resto del método es rápido.',
    mistake: 'Meter la arista primero y dejar la esquina fuera, que te obliga a desmontar el par. Emparejar siempre antes de meter.',
    algDemo: "U R U' R'",
  },
  oll: {
    goal: 'Dejar toda la cara superior de un solo color: orientar las 4 aristas y las 4 esquinas.',
    steps: [
      'Reconoce la forma de las aristas amarillas: punto, L o barra.',
      'Convierte punto en L y L en cruz con la fórmula de la barra.',
      'Con la cruz hecha, busca la esquina amarilla que ya está bien y aplica Sune (o Antisune) sobre las otras tres.',
    ],
    why: 'Con 5 fórmulas de 2-Look orientas cualquier última capa. Después puedes afinar caso por caso con la tabla de 57, que ahorra movimientos.',
    mistake: 'Mirar solo las esquinas y olvidar las aristas: si la cruz no está, la fórmula de esquinas no cierra.',
    algDemo: "R U R' U R U2 R'",
  },
  pll: {
    goal: 'Colocar las piezas de la última capa en su sitio: las esquinas primero, las aristas después.',
    steps: [
      'Busca una arista que ya esté resuelta: es la pista para colocar las 4 esquinas.',
      'Coloca las esquinas con la fórmula de permutación de esquinas (T-Perm y su familia).',
      'Después mueve las 3 aristas con la 3--cycle (U-Perm) o resuelve las 4 con H/V-Perm.',
    ],
    why: 'PLL es el paso que más se nota en los tiempos: se ejecuta con un solo dedo y se reconoce por la forma de los colores del anillo.',
    mistake: 'Empezar a girar sin buscar la arista resuelta, que te deja sin punto de referencia.',
    algDemo: "R' F R' B2 R F' R' B2 R2",
  },
}

export default function Method() {
  return (
    <>
      <section className="hero">
        <h1>El método, capa a capa</h1>
        <p className="lead">
          CFOP son cuatro pasos que se repiten siempre en el mismo orden. Cada uno deja el cubo listo para el siguiente,
          y por eso se pueden aprender y entrenar por separado.
        </p>
      </section>

      {STAGE_ORDER.map((k, i) => {
        const s = STAGES[k]
        const g = GUIDE[k]
        const demo = caseRefs(k)[0]
        const st = caseState(demo.def.algs[0])
        return (
          <section key={k}>
            <div className="section-head">
              <span className="badge">
                Paso {i + 1} · {s.label}
              </span>
              <h2>{s.title}</h2>
            </div>
            <p className="lead">{s.blurb}</p>
            <div className="split">
              <div className="panel">
                <p>{g.goal}</p>
                <ol className="steps">
                  {g.steps.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
                <p className="note">
                  <strong>Por qué</strong> {g.why}
                </p>
                <p className="note">
                  <strong> Fallo típico</strong> {g.mistake}
                </p>
                <div className="row">
                  <a className="btn primary" href={`#/${k}`}>
                    Ver los {s.cases.length} algoritmos
                  </a>
                  <a className="btn" href={`#/entrenar/${k === 'cross' ? 'cruces' : k === 'f2l' ? 'par' : k}`}>
                    Practicar
                  </a>
                </div>
                <StageProgress stage={k} />
              </div>
              <div className="panel center">
                <CaseDiagram state={st} mode={modeFor(demo.def)} size={168} label={`Estado inicial de ${demo.def.name}`} />
                <p className="hint">
                  Ejemplo: <code className="alg">{demo.def.algs[0]}</code>
                </p>
              </div>
            </div>
            {i === 1 && (
              <p className="lead">
                El truco del F2L es siempre el mismo: la puerta del hueco. La secuencia{' '}
                <code className="alg">U R U&apos; R&apos;</code> saca la esquina blanca de la puerta, deja entrar la arista
                y la vuelve a cerrar. Ese pequeño movimiento, repetido, es el 80% del cubo.
              </p>
            )}
          </section>
        )
      })}

      <section>
        <h2>Cómo estudiar</h2>
        <div className="grid cols-3">
          <div className="panel">
            <h3>1. Reconocer</h3>
            <p>
              Mira el diagrama del caso antes de mover nada. El objetivo es ver el patrón, no memorizar letras: si
              reconoces la L y la barra, ya sabes qué fórmula toca.
            </p>
          </div>
          <div className="panel">
            <h3>2. Ejecutar</h3>
            <p>
              Dale al play y sigue el cubo 3D movimiento a movimiento. Verás que el algoritmo termina exactamente en el
              cubo resuelto, y por qué cada giro está ahí.
            </p>
          </div>
          <div className="panel">
            <h3>3. Automatizar</h3>
            <p>
              Practica con el cronómetro y marca el nivel del algoritmo: aprendido, automático o con fingertricks. Tu
              lista se guarda en este navegador.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

void [applyMoves, parseAlg, cloneState, solvedState, isSolved]
