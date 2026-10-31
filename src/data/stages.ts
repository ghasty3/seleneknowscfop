import { CROSS } from './cross'
import { F2L } from './f2l'
import { OLL } from './oll'
import { PLL } from './pll'
import { LOOK2 } from './look2'
import type { CaseDef, StageDef, StageKey } from './types'

export const STAGE_ORDER: StageKey[] = ['cross', 'f2l', 'oll', 'pll']

export const STAGES: Record<StageKey, StageDef> = {
  cross: {
    key: 'cross',
    label: 'Cross',
    title: 'Cross · la cruz blanca',
    blurb: 'El primer paso del CFOP: cruz de aristas blancas en la cara de abajo. Se hace a ojo, en pocos movimientos.',
    cases: CROSS,
  },
  f2l: {
    key: 'f2l',
    label: 'F2L',
    title: 'F2L · primeras dos capas',
    blurb: 'Se resuelven las dos capas inferiores a la vez, introduciendo cada par esquina + arista ya emparejado. 4 pares.',
    cases: F2L,
  },
  oll: {
    key: 'oll',
    label: 'OLL',
    title: 'OLL · orientar la última capa',
    blurb: 'Dejar toda la cara superior amarilla. Empieza por el camino de 2-Look: cruz amarilla y luego orientación de esquinas. Con 5 fórmulas de 2-Look resuelves los 57 casos.',
    cases: [...LOOK2, ...OLL],
  },
  pll: {
    key: 'pll',
    label: 'PLL',
    title: 'PLL · permutar la última capa',
    blurb: 'Colocar las piezas de la última capa en su sitio. Con la capa orientada, solo queda la permutación.',
    cases: PLL,
  },
}

export interface CaseRef {
  id: string
  stage: StageKey
  code: string
  def: CaseDef
}

export function caseRefs(stage: StageKey): CaseRef[] {
  return STAGES[stage].cases.map((def) => ({ id: `${stage}:${def.code}`, stage, code: def.code, def }))
}

export function allCaseRefs(): CaseRef[] {
  return STAGE_ORDER.flatMap(caseRefs)
}

const REF_INDEX = new Map<string, CaseRef>()
for (const ref of allCaseRefs()) {
  REF_INDEX.set(ref.id, ref)
  REF_INDEX.set(`${ref.stage}/${ref.code}`, ref)
}

export function findCase(stage: string, code: string): CaseRef | undefined {
  return REF_INDEX.get(`${stage}:${code}`)
}

export function findCaseById(id: string): CaseRef | undefined {
  return REF_INDEX.get(id)
}

export function neighbors(ref: CaseRef): { prev?: CaseRef; next?: CaseRef } {
  const list = caseRefs(ref.stage)
  const i = list.findIndex((c) => c.code === ref.code)
  return { prev: list[i - 1], next: list[i + 1] }
}
