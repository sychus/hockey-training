// === Elementos de cancha ===

export interface BaseElement {
  id: string
  x: number // 0-100 normalizado (% de la cancha)
  y: number // 0-100 normalizado (% de la cancha)
}

export interface PlayerElement extends BaseElement {
  type: 'player'
  team: 'own' | 'rival'
  label: string
}

export interface BallElement extends BaseElement {
  type: 'ball'
}

export interface ConeElement extends BaseElement {
  type: 'cone'
}

export interface GoalElement extends BaseElement {
  type: 'goal'
  rotation: number
}

export interface MiniGoalElement extends BaseElement {
  type: 'mini-goal'
  rotation: number
}

export interface HurdleElement extends BaseElement {
  type: 'hurdle'
  rotation: number
}

export interface ArrowElement extends BaseElement {
  type: 'arrow'
  toX: number
  toY: number
  style: 'movement' | 'pass' | 'shot' | 'dribble' | 'optional'
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize?: number
}

export type FieldElement =
  | PlayerElement
  | BallElement
  | ConeElement
  | GoalElement
  | MiniGoalElement
  | HurdleElement
  | ArrowElement
  | TextElement

export type ElementType = FieldElement['type']

// === Estructura de sesión ===

export interface Step {
  id: string
  elements: FieldElement[]
}

export interface Play {
  id: string
  title: string
  notes?: string
  steps: Step[] // ordenados, máx 15
}

export interface Session {
  id: string // nanoid, se usa en /s/:id
  ownerToken: string // para futuro multi-DT
  title: string
  description?: string
  plays: Play[] // ordenadas, máx 10
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}
