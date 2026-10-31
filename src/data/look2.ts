import type { CaseDef } from './types'

/**
 * Camino 2-Look de OLL (mismos códigos que la tabla OLL: 2L-1 … 2L-5). Primero cruz
 * las esquinas (Sune / Antisune). Con estas 5 piezas se resuelven los 57 casos.
 */
export const LOOK2: CaseDef[] = [
  {
    code: '2L-1',
    name: 'Barra → cruz',
    expect: 'oll',
    group: 'cruz amarilla',
    short: 'Dos aristas amarillas enfrentadas. Es la base de las otras dos.',
    algs: ["F R U R' U' F'"],
    tips: ['Se aplica con la barra mirándote, horizontal.'],
  },
  {
    code: '2L-2',
    name: 'L → cruz',
    expect: 'oll',
    group: 'cruz amarilla',
    short: 'Aristas amarillas en la izquierda y detrás: gira el cubo y la misma fórmula.',
    algs: ["F R U R' U' F'"],
    tips: ['Coloca la L en la esquina frontal-izquierda y aplica la fórmula de la barra.'],
  },
  {
    code: '2L-3',
    name: 'Punto → L',
    expect: 'oll',
    group: 'cruz amarilla',
    short: 'Ninguna arista amarilla: primero convierte el punto en L.',
    algs: ["f R U R' U' f'"],
    tips: ['Después del punto ya tienes L: aplica la fórmula anterior.'],
  },
  {
    code: '2L-4',
    name: 'Sune (esquinas)',
    expect: 'oll',
    group: 'orientation de esquinas',
    short: 'Con la cruz hecha, 3 esquinas torcidas. La fórmula más rentable de todo el CFOP.',
    algs: ["R U R' U R U2 R'"],
    tips: ['La esquina ya orientada va detrás a la derecha. Setup: y U2, y’ U, x’ U.'],
  },
  {
    code: '2L-5',
    name: 'Antisune (esquinas)',
    expect: 'oll',
    group: 'orientation de esquinas',
    short: 'Las 3 esquinas torcidas al revés: misma mano con U2 al principio.',
    algs: ["R U2 R' U' R U' R'"],
    tips: ['Se reconoce porque la esquina orientada queda delante a la izquierda.'],
  },
]
