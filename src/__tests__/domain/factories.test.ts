import { describe, it, expect } from 'vitest'
import {
  createSession,
  createPlay,
  createStep,
  createPlayer,
  createBall,
  createCone,
  createGoal,
  createMiniGoal,
  createHurdle,
  createArrow,
  createText,
} from '../../domain/factories'

describe('factories', () => {
  describe('createSession', () => {
    it('crea una sesión con valores por defecto', () => {
      const session = createSession({ title: 'Entreno Sub-16' })
      expect(session.id).toBeDefined()
      expect(session.id.length).toBeGreaterThan(10)
      expect(session.ownerToken).toBe('')
      expect(session.title).toBe('Entreno Sub-16')
      expect(session.plays).toEqual([])
      expect(session.createdAt).toBeDefined()
      expect(session.updatedAt).toBeDefined()
    })
  })

  describe('createPlay', () => {
    it('crea una jugada con un paso vacío por defecto', () => {
      const play = createPlay({ title: 'Press alta' })
      expect(play.title).toBe('Press alta')
      expect(play.steps).toHaveLength(1)
      expect(play.steps[0].elements).toEqual([])
    })
  })

  describe('createStep', () => {
    it('crea un paso vacío', () => {
      const step = createStep()
      expect(step.id).toBeDefined()
      expect(step.elements).toEqual([])
    })
  })

  describe('createPlayer', () => {
    it('crea un jugador propio', () => {
      const player = createPlayer({ x: 50, y: 30, team: 'own', label: '7' })
      expect(player.type).toBe('player')
      expect(player.team).toBe('own')
      expect(player.label).toBe('7')
      expect(player.x).toBe(50)
      expect(player.y).toBe(30)
    })

    it('crea un jugador rival', () => {
      const player = createPlayer({ x: 20, y: 60, team: 'rival', label: '3' })
      expect(player.team).toBe('rival')
    })
  })

  describe('createBall', () => {
    it('crea una pelota', () => {
      const ball = createBall({ x: 50, y: 50 })
      expect(ball.type).toBe('ball')
      expect(ball.x).toBe(50)
    })
  })

  describe('createCone', () => {
    it('crea un cono', () => {
      const cone = createCone({ x: 25, y: 60 })
      expect(cone.type).toBe('cone')
    })
  })

  describe('createGoal', () => {
    it('crea un arco con rotación por defecto 0', () => {
      const goal = createGoal({ x: 50, y: 0 })
      expect(goal.type).toBe('goal')
      expect(goal.rotation).toBe(0)
    })

    it('crea un arco con rotación personalizada', () => {
      const goal = createGoal({ x: 50, y: 0, rotation: 90 })
      expect(goal.rotation).toBe(90)
    })
  })

  describe('createMiniGoal', () => {
    it('crea un mini arco', () => {
      const mg = createMiniGoal({ x: 30, y: 40 })
      expect(mg.type).toBe('mini-goal')
      expect(mg.rotation).toBe(0)
    })
  })

  describe('createHurdle', () => {
    it('crea una valla', () => {
      const h = createHurdle({ x: 40, y: 50 })
      expect(h.type).toBe('hurdle')
      expect(h.rotation).toBe(0)
    })
  })

  describe('createArrow', () => {
    it('crea una flecha de pase', () => {
      const arrow = createArrow({
        x: 10,
        y: 20,
        toX: 30,
        toY: 40,
        style: 'pass',
      })
      expect(arrow.type).toBe('arrow')
      expect(arrow.style).toBe('pass')
      expect(arrow.toX).toBe(30)
      expect(arrow.toY).toBe(40)
    })

    it('crea una flecha opcional', () => {
      const arrow = createArrow({
        x: 10,
        y: 20,
        toX: 50,
        toY: 60,
        style: 'optional',
      })
      expect(arrow.style).toBe('optional')
    })
  })

  describe('createText', () => {
    it('crea un texto', () => {
      const text = createText({ x: 50, y: 10, content: '5v3' })
      expect(text.type).toBe('text')
      expect(text.content).toBe('5v3')
    })

    it('crea un texto con fontSize personalizado', () => {
      const text = createText({ x: 50, y: 10, content: 'Nota', fontSize: 18 })
      expect(text.fontSize).toBe(18)
    })
  })
})
