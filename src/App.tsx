import { useEffect, useState } from 'react'
import { STAGES, STAGE_ORDER } from './data/stages'
import type { StageKey } from './data/types'
import Home, { NotFound } from './pages/Home'
import Method from './pages/Method'
import Notation from './pages/Notation'
import StagePage from './pages/StagePage'
import CaseDetail from './pages/CaseDetail'
import Trainer from './pages/Trainer'
import Practice from './pages/Practice'
import Algs from './pages/Algs'
import Reference from './pages/Reference'

function parseHash(): string[] {
  const h = window.location.hash.replace(/^#\/?/, '')
  return h.split('/').filter(Boolean)
}

const SUBS = ['cruces', 'par', 'oll', 'pll'] as const

export default function App() {
  const [path, setPath] = useState<string[]>(() => parseHash())

  useEffect(() => {
    const onHash = () => {
      setPath(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [a, b] = path
  const isStage = !!a && (STAGE_ORDER as string[]).includes(a)

  let page: React.ReactNode
  if (!a) page = <Home />
  else if (a === 'metodo') page = <Method />
  else if (a === 'notacion') page = <Notation />
  else if (a === 'practicar') page = <Practice />
  else if (a === 'entrenar') page = <Trainer sub={b && (SUBS as readonly string[]).includes(b) ? (b as (typeof SUBS)[number]) : 'cruces'} />
  else if (a === 'algs') page = <Algs />
  else if (a === 'tablas') page = <Reference tab={b} />
  else if (isStage) page = b ? <CaseDetail stage={a as StageKey} code={b} /> : <StagePage stage={a as StageKey} />
  else page = <NotFound />

  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="brand">
          Selene <em>knows</em> CFOP
        </a>
        <nav className="nav" aria-label="Secciones">
          <div className="nav-group">
            <span className="nav-kicker">Aprender</span>
            <a href="#/metodo">Método</a>
            {STAGE_ORDER.map((k) => (
              <a key={k} href={`#/${k}`} aria-current={a === k ? 'page' : undefined}>
                {STAGES[k].label}
              </a>
            ))}
          </div>
          <div className="nav-group">
            <span className="nav-kicker">Practicar</span>
            <a href="#/practicar" aria-current={a === 'practicar' ? 'page' : undefined}>
              Practicar
            </a>
            <a href="#/entrenar" aria-current={a === 'entrenar' ? 'page' : undefined}>
              Entrenar
            </a>
          </div>
          <div className="nav-group">
            <span className="nav-kicker">Tuyo</span>
            <a href="#/algs" aria-current={a === 'algs' ? 'page' : undefined}>
              Mis algs
            </a>
            <a href="#/notacion" aria-current={a === 'notacion' ? 'page' : undefined}>
              Notación
            </a>
            <a href="#/tablas" aria-current={a === 'tablas' ? 'page' : undefined}>
              Tablas
            </a>
          </div>
        </nav>
      </header>
      <main className="page">{page}</main>
      <footer className="footer">
        <p>
          Selene knows CFOP · aprende el método paso a paso con un cubo que se mueve. Tu progreso se guarda en este
          navegador. Fuentes de los algoritmos: <a href="#/tablas">tablas de referencia</a>.
        </p>
      </footer>
    </div>
  )
}
