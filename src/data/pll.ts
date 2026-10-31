// Autogenerado con scripts/build-cases.mts — no editar a mano.
// Algoritmo principal: librería pública verificada por el motor (scripts/fixtures/cubzor-pll.json).
// Variantes: conjugaciones por U del principal y transcripciones de la lámina GAN que el motor
// confirma que resuelven ese mismo plantado. La imagen GAN se asigna por firma de última capa,
// no por número (GANCUBE numera los casos en su propio orden).
import type { CaseDef } from './types'

export const PLL: CaseDef[] = [
  {"code":"Ua","name":"PLL Ua","algs":["R U' R U R U R U' R' U' R2"],"ref":"/ref/pll/Ua.svg","expect":"pll"},
  {"code":"Ub","name":"PLL Ub","algs":["R2 U R U R' U' R' U' R' U R'"],"ref":"/ref/pll/Ub.svg","expect":"pll"},
  {"code":"H","name":"PLL H","algs":["M2 U M2 U2 M2 U M2","U M2 U M2 U2 M2 U M2 U'","U2 M2 U M2 U2 M2 U M2 U2","U' M2 U M2 U2 M2 U M2 U"],"ref":"/ref/pll/H.svg","expect":"pll"},
  {"code":"Z","name":"PLL Z","algs":["M' U M2 U M2 U M' U2 M2"],"expect":"pll","ref":"/ref/pll/Z.svg"},
  {"code":"T","name":"PLL T","algs":["R U R' U' R' F R2 U' R' U' R U R' F'"],"ref":"/ref/pll/T.svg","expect":"pll"},
  {"code":"Ja","name":"PLL Ja","algs":["R' U L' U2 R U' R' U2 R L"],"expect":"pll","ref":"/ref/pll/Ja.svg"},
  {"code":"Jb","name":"PLL Jb","algs":["R U R' F' R U R' U' R' F R2 U' R'"],"expect":"pll","ref":"/ref/pll/Jb.svg"},
  {"code":"Ra","name":"PLL Ra","algs":["R U R' F' R U2 R' U2 R' F R U R U2 R'"],"expect":"pll","ref":"/ref/pll/Ra.svg"},
  {"code":"Rb","name":"PLL Rb","algs":["R' U2 R U2 R' F R U R' U' R' F' R2"],"expect":"pll","ref":"/ref/pll/Rb.svg"},
  {"code":"F","name":"PLL F","algs":["R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"],"expect":"pll","ref":"/ref/pll/F.svg"},
  {"code":"Ga","name":"PLL Ga","algs":["R2 U R' U R' U' R U' R2 D U' R' U R D'"],"expect":"pll","ref":"/ref/pll/Ga.svg"},
  {"code":"Gb","name":"PLL Gb","algs":["R' U' R U D' R2 U R' U R U' R U' R2 D"],"expect":"pll","ref":"/ref/pll/Gb.svg"},
  {"code":"Gc","name":"PLL Gc","algs":["R2 U' R U' R U R' U R2 D' U R U' R' D"],"expect":"pll","ref":"/ref/pll/Gc.svg"},
  {"code":"Gd","name":"PLL Gd","algs":["R U R' U' D R2 U' R U' R' U R' U R2 D'"],"expect":"pll","ref":"/ref/pll/Gd.svg"},
  {"code":"Aa","name":"PLL Aa","algs":["x R' U R' D2 R U' R' D2 R2 x'"],"ref":"/ref/pll/Aa.svg","expect":"pll"},
  {"code":"Ab","name":"PLL Ab","algs":["x R2 D2 R U R' D2 R U' R x'"],"ref":"/ref/pll/Ab.svg","expect":"pll"},
  {"code":"E","name":"PLL E","algs":["x' R U' R' D R U R' D' R U R' D R U' R' D' x","U x' R U' R' D R U R' D' R U R' D R U' R' D' x U'","U2 x' R U' R' D R U R' D' R U R' D R U' R' D' x U2","U' x' R U' R' D R U R' D' R U R' D R U' R' D' x U"],"ref":"/ref/pll/E.svg","expect":"pll"},
  {"code":"Y","name":"PLL Y","algs":["F R U' R' U' R U R' F' R U R' U' R' F R F'"],"ref":"/ref/pll/Y.svg","expect":"pll"},
  {"code":"V","name":"PLL V","algs":["R' U R' U' y R' F' R2 U' R' U R' F R F"],"expect":"pll","ref":"/ref/pll/V.svg"},
  {"code":"Na","name":"PLL Na","algs":["R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"],"expect":"pll","ref":"/ref/pll/Na.svg"},
  {"code":"Nb","name":"PLL Nb","algs":["R' U R U' R' F' U' F R U R' F R' F' R U' R"],"expect":"pll","ref":"/ref/pll/Nb.svg"},
]
