import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { CaseDiagram } from '../src/components/CaseDiagram'
import { canonicalView } from '../src/cube/caseUtils'
import { PLL } from '../src/data/pll'

const CODES = process.argv.slice(2).length ? process.argv.slice(2) : ['Ua', 'H', 'Z', 'T', 'Ja', 'V', 'Ga', 'E']
const cards: string[] = []
for (const code of CODES) {
  const def = PLL.find((c) => c.code === code)
  if (!def) continue
  const state = canonicalView(def.algs[0]).state
  const svg = renderToStaticMarkup(createElement(CaseDiagram, { state, mode: 'pll', size: 380, label: code }))
  cards.push(`<figure><figcaption>${def.name}</figcaption>${svg}</figure>`)
}
const html = `<!doctype html><meta charset="utf-8"><style>
body{background:#0a0810;color:#e8e3f2;font:14px/1.4 system-ui;margin:16px}
main{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
figure{margin:0;text-align:center}figcaption{margin-bottom:6px;font-weight:600}
svg{background:#141021;border-radius:10px}
</style><title>Diagramas PLL</title><main>${cards.join('')}</main>`
process.stdout.write(html)
