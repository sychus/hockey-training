import { describe, it, expect } from 'vitest'
import { interpolateElements } from '../../domain/animation'
import { createPlayer, createBall } from '../../domain/factories'
import type { ArrowElement, FieldElement, GoalElement } from '../../types'

describe('interpolateElements', () => {
  it('interpola posiciones entre dos pasos (t=0.5)', () => {
    const step1: FieldElement[] = [
      { ...createPlayer({ x: 0, y: 0, team: 'own', label: '7' }), id: 'p1' },
    ]
    const step2: FieldElement[] = [
      { ...createPlayer({ x: 100, y: 100, team: 'own', label: '7' }), id: 'p1' },
    ]

    const result = interpolateElements(step1, step2, 0.5)
    expect(result[0].x).toBeCloseTo(50)
    expect(result[0].y).toBeCloseTo(50)
  })

  it('devuelve step1 cuando t=0', () => {
    const step1: FieldElement[] = [
      { ...createPlayer({ x: 20, y: 30, team: 'own', label: '7' }), id: 'p1' },
    ]
    const step2: FieldElement[] = [
      { ...createPlayer({ x: 80, y: 90, team: 'own', label: '7' }), id: 'p1' },
    ]

    const result = interpolateElements(step1, step2, 0)
    expect(result[0].x).toBe(20)
    expect(result[0].y).toBe(30)
  })

  it('devuelve step2 cuando t=1', () => {
    const step1: FieldElement[] = [
      { ...createPlayer({ x: 20, y: 30, team: 'own', label: '7' }), id: 'p1' },
    ]
    const step2: FieldElement[] = [
      { ...createPlayer({ x: 80, y: 90, team: 'own', label: '7' }), id: 'p1' },
    ]

    const result = interpolateElements(step1, step2, 1)
    expect(result[0].x).toBe(80)
    expect(result[0].y).toBe(90)
  })

  it('maneja elementos que solo existen en step2 (aparecen)', () => {
    const step1: FieldElement[] = []
    const step2: FieldElement[] = [{ ...createBall({ x: 50, y: 50 }), id: 'b1' }]

    const result = interpolateElements(step1, step2, 0.5)
    expect(result).toHaveLength(1)
    expect(result[0].x).toBe(50)
  })

  it('interpola flechas (toX, toY)', () => {
    const step1: FieldElement[] = [
      {
        id: 'a1',
        type: 'arrow',
        x: 0,
        y: 0,
        toX: 10,
        toY: 10,
        style: 'pass',
      } satisfies ArrowElement,
    ]
    const step2: FieldElement[] = [
      {
        id: 'a1',
        type: 'arrow',
        x: 50,
        y: 50,
        toX: 60,
        toY: 60,
        style: 'pass',
      } satisfies ArrowElement,
    ]

    const result = interpolateElements(step1, step2, 0.5)
    const arrow = result[0] as ArrowElement
    expect(arrow.x).toBeCloseTo(25)
    expect(arrow.toX).toBeCloseTo(35)
  })

  it('interpola rotación de elementos rotables', () => {
    const step1: FieldElement[] = [
      { id: 'g1', type: 'goal', x: 50, y: 0, rotation: 0 } satisfies GoalElement,
    ]
    const step2: FieldElement[] = [
      { id: 'g1', type: 'goal', x: 50, y: 0, rotation: 90 } satisfies GoalElement,
    ]

    const result = interpolateElements(step1, step2, 0.5)
    const goal = result[0] as GoalElement
    expect(goal.rotation).toBeCloseTo(45)
  })

  it('interpola múltiples elementos simultáneamente', () => {
    const step1: FieldElement[] = [
      { ...createPlayer({ x: 10, y: 10, team: 'own', label: '1' }), id: 'p1' },
      { ...createPlayer({ x: 20, y: 20, team: 'rival', label: '2' }), id: 'p2' },
      { ...createBall({ x: 15, y: 15 }), id: 'b1' },
    ]
    const step2: FieldElement[] = [
      { ...createPlayer({ x: 50, y: 50, team: 'own', label: '1' }), id: 'p1' },
      { ...createPlayer({ x: 60, y: 60, team: 'rival', label: '2' }), id: 'p2' },
      { ...createBall({ x: 55, y: 55 }), id: 'b1' },
    ]

    const result = interpolateElements(step1, step2, 0.5)
    expect(result).toHaveLength(3)
    expect(result[0].x).toBeCloseTo(30)
    expect(result[1].x).toBeCloseTo(40)
    expect(result[2].x).toBeCloseTo(35)
  })
})
