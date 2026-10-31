export interface NotationSymbol {
  sym: string
  label: string
  kind: 'cara' | 'corte' | 'ancha' | 'rotacion'
  /** Dedo que suele empujar el giro, según la leyenda de dedos de GANCUBE. */
  finger?: 'azul' | 'rojo' | 'naranja'
  desc: string
}

export const NOTATION: NotationSymbol[] = [
  {
    sym: 'R',
    label: 'Cara derecha',
    kind: 'cara',
    finger: 'naranja',
    desc: 'Gira la cara derecha 90° como si la subieras. R’ es al revés, R2 son 180°.',
  },
  {
    sym: 'L',
    label: 'Cara izquierda',
    kind: 'cara',
    finger: 'azul',
    desc: 'Gira la cara izquierda 90° en el sentido contrario a R. L’ y L2 igual que en R.',
  },
  {
    sym: 'U',
    label: 'Cara superior',
    kind: 'cara',
    finger: 'azul',
    desc: 'Gira la capa de arriba 90° con el índice izquierdo. U’ con el pulgar derecho.',
  },
  {
    sym: 'D',
    label: 'Cara inferior',
    kind: 'cara',
    finger: 'rojo',
    desc: 'Gira la capa de abajo 90°. Es el giro que empuja el pulgar derecho.',
  },
  {
    sym: 'F',
    label: 'Cara frontal',
    kind: 'cara',
    finger: 'azul',
    desc: 'Gira la cara que tienes delante 90°, subiendo por la izquierda.',
  },
  {
    sym: 'B',
    label: 'Cara trasera',
    kind: 'cara',
    finger: 'naranja',
    desc: 'Gira la cara de atrás 90°. Se hace con los dedos anulares de arriba hacia abajo.',
  },
  {
    sym: 'M',
    label: 'Corte medio (vertical)',
    kind: 'corte',
    finger: 'azul',
    desc:
      'Capa invisible entre L y R. M sigue el sentido de L; M’ el de R. Es la capa que mueven los casos Ua, Ub, H y Z de F2L.',
  },
  {
    sym: 'E',
    label: 'Corte medio (horizontal)',
    kind: 'corte',
    finger: 'rojo',
    desc: 'Capa invisible entre U y D. E sigue el sentido de D.',
  },
  {
    sym: 'S',
    label: 'Corte medio (frontal)',
    kind: 'corte',
    finger: 'azul',
    desc: 'Capa invisible entre F y B. S sigue el sentido de F.',
  },
  {
    sym: 'r',
    label: 'Capa ancha derecha',
    kind: 'ancha',
    finger: 'naranja',
    desc: 'r = R + M’: las dos capas de la derecha a la vez. Muy usada en OLL (los casos con r).',
  },
  {
    sym: 'l',
    label: 'Capa ancha izquierda',
    kind: 'ancha',
    finger: 'azul',
    desc: 'l = L + M: las dos capas de la izquierda a la vez.',
  },
  {
    sym: 'u',
    label: 'Capa ancha superior',
    kind: 'ancha',
    desc: 'u = U + E: las dos capas de arriba a la vez.',
  },
  {
    sym: 'd',
    label: 'Capa ancha inferior',
    kind: 'ancha',
    desc: 'd = D + E: las dos capas de abajo a la vez.',
  },
  {
    sym: 'f',
    label: 'Capa ancha frontal',
    kind: 'ancha',
    desc: 'f = F + S: las dos capas frontales a la vez.',
  },
  {
    sym: 'b',
    label: 'Capa ancha trasera',
    kind: 'ancha',
    desc: 'b = B + S’: las dos capas traseras a la vez.',
  },
  {
    sym: 'x',
    label: 'Rotación del cubo',
    kind: 'rotacion',
    desc: 'Gira todo el cubo como un R. Sirve para mirar un hueco sin girar piezas. x’ = todo el cubo como L.',
  },
  {
    sym: 'y',
    label: 'Rotación del cubo',
    kind: 'rotacion',
    desc: 'Gira todo el cubo como un U. Se usa para cambiar de hueco y para los setups de Sune.',
  },
  {
    sym: 'z',
    label: 'Rotación del cubo',
    kind: 'rotacion',
    desc: 'Gira todo el cubo como un L. Habitual en casos Ja/Jb y en F2L con el hueco mirando a la izquierda.',
  },
  {
    sym: "'",
    label: 'Sentido inverso',
    kind: 'cara',
    desc: "El apóstrofo significa el giro al revés: R’ es R en sentido antihorario.",
  },
  {
    sym: '2',
    label: 'Media vuelta',
    kind: 'cara',
    desc: 'El 2 son 180°, en cualquier sentido: R2, U2, M2.',
  },
]
