/**
 * Paleta del cubo — pegatinas de un speedcube Moyu (Meilong) sobre fondo oscuro.
 * ES LA FUENTE DE VERDAD del color del cubo; los tokens `--c-face-*` de
 * src/styles/global.css son un espejo para las superficies hechas sólo con CSS.
 *
 * Esquema de colores estándar, comprobado pieza por pieza:
 *   amarillo (U) opuesto a blanco (D) · verde (F) opuesto a azul (B) · rojo (L) opuesto a naranja (R)
 * Con la cara amarilla arriba y la verde delante, el rojo queda a la IZQUIERDA:
 * es el que verás en cualquier cubo real cogido así.
 */

export const FACE_HEX: Record<string, string> = {
  U: '#f5d300', // amarillo
  D: '#f2f0ec', // blanco
  F: '#00a753', // verde
  B: '#1f52c9', // azul
  R: '#ef7215', // naranja
  L: '#df2b2b', // rojo
}

/** Variante atenuada para pegatinas que no miran a la cámara. */
export const FACE_HEX_DIM: Record<string, string> = {
  U: '#d3b400',
  D: '#cfcaca',
  F: '#009047',
  B: '#1b46ad',
  R: '#ce6212',
  L: '#c12525',
}

/** Plástico del cuerpo (Moyu Meilong: blanco roto). */
export const BODY_HEX = '#ded9d1'
export const BODY_HEX_DIM = '#b8b3ac'
/** Núcleo: oscuro para que las separaciones entre piezas se lean. */
export const CORE_HEX = '#120e1c'

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function rgbToHex(c: [number, number, number]): string {
  return '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('')
}

export function shade(hex: string, k: number): string {
  return rgbToHex(hexToRgb(hex).map((x) => x * k) as [number, number, number])
}
