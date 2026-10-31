import { canonicalView } from '../src/cube/caseUtils'

const ALGS = [
  "R U R' U' R' F R2 U' R' U' R' F' R", // Ua tal cual
  "y R U R' U' R' F R2 U' R' U' R' F'", // Ua con preparación escrita
  "x R U2 R' U' R U' R'", // Sune con preparación
  "R U R' U' R' F R F'", // sexy + permo
]
for (const alg of ALGS) {
  const v = canonicalView(alg)
  console.log(JSON.stringify({ alg: alg.slice(0, 28), rot: v.rot, play: v.play.slice(0, 46) }))
}
