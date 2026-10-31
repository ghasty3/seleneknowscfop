import { solvedState } from '../src/cube/engine'
const s = solvedState()
const centers = s.cubies.filter((c) => c.pos.filter((v) => v !== 0).length === 1)
console.log('centros:', centers.length, centers.map((c) => `[${c.pos}] rot=${JSON.stringify(c.rot)}`))
console.log('total cubies:', s.cubies.length)
