export type StageKey = 'cross' | 'f2l' | 'oll' | 'pll'

/** Estructura esperada del estado plantado de un caso (para la verificación del motor). */
export type Expect =
  | 'f2l-top' // par (esquina + arista blancas) en la capa U, un slot libre
  | 'f2l-slot' // par ya dentro del slot, mal unido / bloqueado
  | 'oll' // dos primeras capas resueltas, piezas de la U en su sitio, orientación tocada
  | 'pll' // dos primeras capas resueltas, última capa orientada, permutada
  | 'cross' // ejercicio de cruz: la arista objetivo termina colocada
  | 'free' // sin comprobación de patrón (demostraciones de notación)

export interface CaseDef {
  code: string
  name: string
  algs: string[]
  expect: Expect
  group?: string
  short?: string
  tips?: string[]
  /** Imagen oficial de referencia (recorte de la lámina GAN), ruta pública. */
  ref?: string
  /** Algoritmo espejo de otro caso (se genera con mirrorAlg). */
  mirrorOf?: { stage: StageKey; code: string }
  /** Algoritmo generado por BFS en lugar del transcrito. */
  generated?: boolean
  /** Patrón esperado del estado plantado (verificación del motor). */
  sig?: Record<string, string | number>
}

export interface StageDef {
  key: StageKey
  label: string
  title: string
  blurb: string
  cases: CaseDef[]
}

export const caseId = (stage: StageKey, code: string) => `${stage}:${code}`
