import type { CaseDef } from './types'

/**
 * 57 casos de OLL transcritos de la tabla GANCUBE (varias variantes por caso).
 * Normalizados al parser del motor: sin paréntesis de grupo, sin `或OR`, los
 * grupos `(X Y)2` expandidos. El caso 47 de la tabla se descarta (usa exponente
 * de grupo que el parser no admite).
 *
 * La clasificación por patrón (punto / L / barra / cruz + esquinas torcidas) se
 * calcula desde el estado plantado en `caseUtils`, no a mano (RF-6).
 */
const raw: [number, string[]][] = [
  [1, ["R U' U R2 F R F' U2 R U' R'"]],
  [2, ["F R U R' U' F' f R U R' U' f'"]],
  [3, ["f R U R' U' f' F R U R' U' F'"]],
  [4, ["f R U R' U' f' F R U R' U' F'"]],
  [5, ["r' U2 R U' U r", "y2 r' U2 L U L' U' U"]],
  [6, ["r' U' R U' R' U r", "y2 l' U2 L' U' L U' l'"]],
  [7, ["r U R' U' R U U' r'", "y2 l' U' L' U L U2 l'"]],
  [8, ["r' U' R U R' U2 r", "y2 r' U' L' U' L' U2 l'"]],
  [9, ["R U R' U' R F R2 U R' U' F'"]],
  [10, ["R U R' U R' F R F'"]],
  [11, ["r' R2 U' R R U' U' R M'"]],
  [12, ["M' R' U' R U R' U2 R' U' M"]],
  [13, ["f R U R2 U' R' U U R f'"]],
  [14, ["R' F R U R' F R F U' F'"]],
  [15, ["r' U r R' U R U R' U r"]],
  [16, ["r U r' R U R' U R U' r'"]],
  [17, ["R U R' U R' F R F' U2 R' F R F'"]],
  [18, ["r U' U R U U' R' R' U2 R"]],
  [19, ["r' R U R U U' R' R' F R F'"]],
  [20, ["r U R' U M2 U' R U R' U' M'"]],
  [21, ["R U' U' R' U R' U' R U' R'"]],
  [22, ["R U' U R2 U' R2 U' R2 U U R"]],
  [23, ["R2 D R' U' R' D' R U' U R"]],
  [24, ["r U R' U r' F R F'"]],
  [25, ["R U' U' R' U R U' r' F R"]],
  [26, ["R U' U R' U R U' R'", "y' R U R' U' R' U2 R y' U2 R"]],
  [27, ["R U' U R' U R U' R' U' U R"]],
  [28, ["r U R' U r' F R"]],
  [29, ["R U R' U R U' R' F' U' F R U R'"]],
  [30, ["f R U R' U' R' U R2 U' R' f'"]],
  [31, ["R' F R U R' U' F2 U F R'"]],
  [32, ["R U R' U B R B'", "S R U' R' U' R' F R F'"]],
  [33, ["R U' U R' F R F'"]],
  [34, ["R U R2 U' R' F R U U' R' F"]],
  [35, ["R U' U' R' U R F' U U' R' U"]],
  [36, ["R' U' R U' R' U R U U U' R' U"]],
  [37, ["F R U R' U' R U R' F'"]],
  [38, ["R U R' U R U R' U' R' F R F'"]],
  [39, ["R U R' F' U' F U R U2 R'"]],
  [40, ["R' F R2 U' R' U' F' U R"]],
  [41, ["R U R' U R U R' U' F'"]],
  [42, ["R' U' R U R' U2 R F'"]],
  [43, ["B' U' R' U R B", "F L' U' L U f"]],
  [44, ["r U R' U' R U r f'"]],
  [45, ["F R U R' U' F'"]],
  [46, ["R' U' R' F R F' U R"]],
  [48, ["F R U R' U' R U R' U' F'"]],
  [49, ["R B' R2 F R2 B R2 F' R"]],
  [50, ["r' U R U' U' r2 U' r2 U r'"]],
  [51, ["f R U R' U' R U R' U' f'"]],
  [52, ["R' F' U' F U' R U' U R"]],
  [53, ["r' U2 R U' U r"]],
  [54, ["r' U' R' U R U' R U' R' r"]],
  [55, ["r' U' U' R' U r' R2 U R' U r' U' r'"]],
  [56, ["r U r' U R U' R2 r' U' r'", "r R U F' U' F R U R' U R' F R F'"]],
  [57, ["R U R' U' M' U R U' r"]],
]

export const OLL: CaseDef[] = raw.map(([n, algs]) => ({
  code: String(n),
  name: `OLL ${n}`,
  expect: 'oll',
  algs,
}))
