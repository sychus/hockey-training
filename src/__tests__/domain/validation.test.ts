import { describe, it, expect } from 'vitest'
import {
  canAddPlay,
  canAddStep,
  getRemainingPlays,
  getRemainingSteps,
} from '../../domain/validation'
import { createSession, createPlay, createStep } from '../../domain/factories'
import { MAX_PLAYS_PER_SESSION, MAX_STEPS_PER_PLAY } from '../../lib/constants'

describe('validation', () => {
  describe('canAddPlay', () => {
    it('permite agregar jugada cuando hay espacio', () => {
      const session = createSession({ title: 'Test' })
      expect(canAddPlay(session)).toBe(true)
    })

    it('no permite agregar jugada cuando se alcanzó el límite', () => {
      const session = createSession({ title: 'Test' })
      session.plays = Array.from({ length: MAX_PLAYS_PER_SESSION }, (_, i) =>
        createPlay({ title: `Jugada ${i + 1}` }),
      )
      expect(canAddPlay(session)).toBe(false)
    })
  })

  describe('canAddStep', () => {
    it('permite agregar paso cuando hay espacio', () => {
      const play = createPlay({ title: 'Test' })
      expect(canAddStep(play)).toBe(true)
    })

    it('no permite agregar paso cuando se alcanzó el límite', () => {
      const play = createPlay({ title: 'Test' })
      play.steps = Array.from({ length: MAX_STEPS_PER_PLAY }, () => createStep())
      expect(canAddStep(play)).toBe(false)
    })
  })

  describe('getRemainingPlays', () => {
    it('devuelve la cantidad restante', () => {
      const session = createSession({ title: 'Test' })
      session.plays = [createPlay({ title: 'J1' }), createPlay({ title: 'J2' })]
      expect(getRemainingPlays(session)).toBe(MAX_PLAYS_PER_SESSION - 2)
    })
  })

  describe('getRemainingSteps', () => {
    it('devuelve la cantidad restante', () => {
      const play = createPlay({ title: 'Test' })
      // createPlay ya crea 1 paso
      expect(getRemainingSteps(play)).toBe(MAX_STEPS_PER_PLAY - 1)
    })
  })
})
