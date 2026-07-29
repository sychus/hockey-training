import { nanoid } from 'nanoid'
import type {
  Session,
  Play,
  Step,
  PlayerElement,
  BallElement,
  ConeElement,
  GoalElement,
  MiniGoalElement,
  HurdleElement,
  ArrowElement,
  TextElement,
} from '../types'

export function createSession(data: { title: string; description?: string }): Session {
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    ownerToken: '',
    title: data.title,
    description: data.description,
    plays: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createPlay(data: { title: string; notes?: string }): Play {
  return {
    id: nanoid(),
    title: data.title,
    notes: data.notes,
    steps: [createStep()],
  }
}

export function createStep(): Step {
  return {
    id: nanoid(),
    elements: [],
  }
}

export function createPlayer(data: {
  x: number
  y: number
  team: 'own' | 'rival'
  label: string
}): PlayerElement {
  return { id: nanoid(), type: 'player', ...data }
}

export function createBall(data: { x: number; y: number }): BallElement {
  return { id: nanoid(), type: 'ball', ...data }
}

export function createCone(data: { x: number; y: number }): ConeElement {
  return { id: nanoid(), type: 'cone', ...data }
}

export function createGoal(data: { x: number; y: number; rotation?: number }): GoalElement {
  return { id: nanoid(), type: 'goal', rotation: 0, ...data }
}

export function createMiniGoal(data: {
  x: number
  y: number
  rotation?: number
}): MiniGoalElement {
  return { id: nanoid(), type: 'mini-goal', rotation: 0, ...data }
}

export function createHurdle(data: {
  x: number
  y: number
  rotation?: number
}): HurdleElement {
  return { id: nanoid(), type: 'hurdle', rotation: 0, ...data }
}

export function createArrow(data: {
  x: number
  y: number
  toX: number
  toY: number
  style: ArrowElement['style']
}): ArrowElement {
  return { id: nanoid(), type: 'arrow', ...data }
}

export function createText(data: {
  x: number
  y: number
  content: string
  fontSize?: number
}): TextElement {
  return { id: nanoid(), type: 'text', ...data }
}
