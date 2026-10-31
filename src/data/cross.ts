import type { CaseDef } from './types'

/**
 * Cruz blanca: colocación de las 4 aristas alrededor de la pieza de centro de la
 * cara inferior. Cada ejercicio deja la arista objetivo arriba y las otras tres
 * ya colocadas, de forma que el algoritmo termina con la cruz terminada.
 * `verify.mts` descarta los que no cumplen esa estructura.
 */
export const CROSS: CaseDef[] = [
  {
    code: 'F2',
    name: 'Blanco mirando al frente',
    expect: 'cross',
    group: 'arista arriba',
    short: 'La arista blanca está arriba con el blanco de frente: dos medias vueltas de la cara frontal.',
    tips: [
      'Localiza primero el hueco de abajo antes de tocar nada.',
      'Con el blanco mirando a tu cara, F2 lo resuelve sin pensar.',
    ],
    algs: ['F2'],
  },
  {
    code: 'B2',
    name: 'Blanco mirando atrás',
    expect: 'cross',
    group: 'arista arriba',
    short: 'Mismo caso con la arista en la cara trasera: B2.',
    algs: ['B2'],
  },
  {
    code: "U' F2 U",
    name: 'Blanco arriba, hueco a la derecha',
    expect: 'cross',
    group: 'arista arriba',
    short: 'Alineas el blanco con su centro y metes con dos medias vueltas.',
    tips: ['Primero alinea la arista con el centro de su color, luego F2.'],
    algs: ["U' F2 U"],
  },
  {
    code: "U2 F2 U2",
    name: 'Blanco arriba, hueco enfrente',
    expect: 'cross',
    group: 'arista arriba',
    short: 'Alineación de 180° y media vuelta frontal.',
    algs: ['U2 F2 U2'],
  },
  {
    code: "R2",
    name: 'Blanco a la derecha',
    expect: 'cross',
    group: 'arista arriba',
    short: 'Igual que F2 pero con la cara derecha.',
    algs: ['R2'],
  },
  {
    code: "L2",
    name: 'Blanco a la izquierda',
    expect: 'cross',
    group: 'arista arriba',
    short: 'Igual que F2 pero con la cara izquierda.',
    algs: ['L2'],
  },
]
