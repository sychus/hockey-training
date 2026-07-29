import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../../stores/editor-store'
import { createPlayer } from '../../domain/factories'

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  describe('plays', () => {
    it('agrega una jugada', () => {
      useEditorStore.getState().addPlay('Press alta')
      const state = useEditorStore.getState()
      expect(state.session.plays).toHaveLength(1)
      expect(state.session.plays[0].title).toBe('Press alta')
      expect(state.session.plays[0].steps).toHaveLength(1)
    })

    it('no agrega más de 10 jugadas', () => {
      const store = useEditorStore.getState()
      for (let i = 0; i < 12; i++) {
        store.addPlay(`Jugada ${i + 1}`)
      }
      expect(useEditorStore.getState().session.plays).toHaveLength(10)
    })

    it('elimina una jugada', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.addPlay('Jugada 2')
      const playId = useEditorStore.getState().session.plays[0].id
      store.removePlay(playId)
      expect(useEditorStore.getState().session.plays).toHaveLength(1)
      expect(useEditorStore.getState().session.plays[0].title).toBe('Jugada 2')
    })

    it('reordena jugadas', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.addPlay('Jugada 2')
      store.addPlay('Jugada 3')
      store.reorderPlays(2, 0)
      const titles = useEditorStore.getState().session.plays.map((p) => p.title)
      expect(titles).toEqual(['Jugada 3', 'Jugada 1', 'Jugada 2'])
    })

    it('actualiza el título de una jugada', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      const playId = useEditorStore.getState().session.plays[0].id
      store.updatePlayTitle(playId, 'Press alta')
      expect(useEditorStore.getState().session.plays[0].title).toBe('Press alta')
    })

    it('actualiza las notas de una jugada', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      const playId = useEditorStore.getState().session.plays[0].id
      store.updatePlayNotes(playId, '5v3 to 4v4')
      expect(useEditorStore.getState().session.plays[0].notes).toBe('5v3 to 4v4')
    })
  })

  describe('steps', () => {
    it('agrega un paso a la jugada activa', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.addStep()
      const play = useEditorStore.getState().session.plays[0]
      expect(play.steps).toHaveLength(2)
    })

    it('no agrega más de 15 pasos', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      for (let i = 0; i < 20; i++) {
        store.addStep()
      }
      expect(useEditorStore.getState().session.plays[0].steps).toHaveLength(15)
    })

    it('elimina un paso', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.addStep()
      const stepId = useEditorStore.getState().session.plays[0].steps[1].id
      store.removeStep(stepId)
      expect(useEditorStore.getState().session.plays[0].steps).toHaveLength(1)
    })

    it('no elimina el último paso', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      const stepId = useEditorStore.getState().session.plays[0].steps[0].id
      store.removeStep(stepId)
      expect(useEditorStore.getState().session.plays[0].steps).toHaveLength(1)
    })

    it('duplica un paso', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)

      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      store.duplicateStep(0)

      const play = useEditorStore.getState().session.plays[0]
      expect(play.steps).toHaveLength(2)
      expect(play.steps[1].elements).toHaveLength(1)
      expect(play.steps[1].elements[0].x).toBe(50)
      // IDs de pasos deben ser diferentes
      expect(play.steps[0].id).not.toBe(play.steps[1].id)
    })
  })

  describe('elements', () => {
    it('agrega un elemento al paso activo', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      const step = useEditorStore.getState().session.plays[0].steps[0]
      expect(step.elements).toHaveLength(1)
      expect(step.elements[0].type).toBe('player')
    })

    it('no agrega elemento sin jugada/paso activo', () => {
      const store = useEditorStore.getState()
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      // No hay jugada activa, no debería pasar nada
      expect(useEditorStore.getState().session.plays).toHaveLength(0)
    })

    it('mueve un elemento (actualiza x, y)', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      store.moveElement(player.id, 70, 30)
      const step = useEditorStore.getState().session.plays[0].steps[0]
      expect(step.elements[0].x).toBe(70)
      expect(step.elements[0].y).toBe(30)
    })

    it('elimina un elemento', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      store.removeElement(player.id)
      const step = useEditorStore.getState().session.plays[0].steps[0]
      expect(step.elements).toHaveLength(0)
    })

    it('actualiza un elemento', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      store.updateElement(player.id, { label: '10' } as Partial<typeof player>)
      const step = useEditorStore.getState().session.plays[0].steps[0]
      expect((step.elements[0] as typeof player).label).toBe('10')
    })

    it('deselecciona un elemento al eliminarlo', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.setActiveStep(0)
      const player = createPlayer({ x: 50, y: 50, team: 'own', label: '7' })
      store.addElement(player)
      store.selectElement(player.id)
      expect(useEditorStore.getState().selectedElementId).toBe(player.id)
      store.removeElement(player.id)
      expect(useEditorStore.getState().selectedElementId).toBeNull()
    })
  })

  describe('navigation', () => {
    it('navega entre jugadas', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.addPlay('Jugada 2')
      store.setActivePlay(1)
      expect(useEditorStore.getState().activePlayIndex).toBe(1)
    })

    it('setActivePlay resetea activeStepIndex a 0', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      expect(useEditorStore.getState().activeStepIndex).toBe(0)
    })

    it('navega entre pasos', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)
      store.addStep()
      store.setActiveStep(1)
      expect(useEditorStore.getState().activeStepIndex).toBe(1)
    })

    it('selecciona y deselecciona elementos', () => {
      const store = useEditorStore.getState()
      store.selectElement('some-id')
      expect(useEditorStore.getState().selectedElementId).toBe('some-id')
      store.selectElement(null)
      expect(useEditorStore.getState().selectedElementId).toBeNull()
    })
  })

  describe('session', () => {
    it('actualiza el título de la sesión', () => {
      const store = useEditorStore.getState()
      store.updateSessionTitle('Entreno Sub-16')
      expect(useEditorStore.getState().session.title).toBe('Entreno Sub-16')
    })

    it('actualiza la descripción de la sesión', () => {
      const store = useEditorStore.getState()
      store.updateSessionDescription('Práctica de press')
      expect(useEditorStore.getState().session.description).toBe('Práctica de press')
    })

    it('setSession reemplaza toda la sesión y resetea navegación', () => {
      const store = useEditorStore.getState()
      store.addPlay('Jugada 1')
      store.setActivePlay(0)

      const newSession = {
        ...useEditorStore.getState().session,
        title: 'Otra sesión',
      }
      store.setSession(newSession)
      expect(useEditorStore.getState().session.title).toBe('Otra sesión')
      expect(useEditorStore.getState().activePlayIndex).toBe(-1)
    })
  })
})
