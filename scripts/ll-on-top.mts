/**
 * Convierte algoritmos escritos para agarrar con la cruz arriba (M/E/S) a la convención
 * canónica del proyecto: última capa arriba (U), sin capas centrales.
 *
 *   x2 · R · x2 = r        x2 · M · x2 = l'       x2 · U · x2 = U
 *   x2 · M' · x2 = l       x2 · E · x2 = E'       x2 · S · x2 = f
 *
 * La conjugación por x2 es un cambio de agarre (media vuelta sobre el eje izquierda-derecha):
 * el cubo es el mismo, lo que cambia es qué cara llamamos arriba. Por eso el algoritmo
 * convertido produce la misma permutación relativa que el original y el plantado
 * `inverse(alg)` deja las dos primeras capas resueltas.
 */
const MAP: Record<string, string> = {
  M: "l'", "M'": 'l', M2: 'l2',
  E: "E'", "E'": 'E', E2: 'E2',
  S: 'f', "S'": "f'", S2: 'f2',
}
// E y S se escriben igual tras la conjugación; las capas centrales desaparecen al pasar a U arriba.
export function toLlOnTop(alg: string): { alg: string; sliceMoves: number } {
  const toks = alg.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean)
  const out: string[] = []
  let n = 0
  for (const t of toks) {
    const m = t.match(/^(M|E|S)(['2]*)$/)
    if (!m) { out.push(t); continue }
    n++
    const key = m[1] + m[2]
    out.push(MAP[key] ?? MAP[m[1] + "'"] ?? t)
  }
  return { alg: out.join(' '), sliceMoves: n }
}
