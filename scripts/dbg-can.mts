import { PLL } from '../src/data/pll.ts'
import { OLL } from '../src/data/oll.ts'
import { cloneState, applyMoves, parseAlg, isSolved, frameMatrix } from '../src/cube/engine.ts'
import { canonicalView, llOnTopView, f2lSolvedRel } from '../src/cube/caseUtils.ts'
for (const [arr, name] of [[PLL,'PLL'],[OLL,'OLL']] as const) {
  let ok=0, rotFound=0, bad:string[]=[]
  for (const c of arr) {
    const v = canonicalView(c.algs[0])
    const closed = (()=>{const t=cloneState(v.state); applyMoves(t, parseAlg(v.play)); return isSolved(t)})()
    const top = llOnTopView(v.state)
    const f2l = f2lSolvedRel(v.state)
    if (v.rot) rotFound++
    if (closed && top && f2l) ok++
    else bad.push(`${c.code} rot=${JSON.stringify(v.rot)} closed=${closed} top=${top} f2l=${f2l}`)
  }
  console.log(name, 'ok', ok, '/', arr.length, 'rot', rotFound)
  bad.slice(0,6).forEach(b=>console.log('  ', b))
}
