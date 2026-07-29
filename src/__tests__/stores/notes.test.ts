import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../../stores/editor-store'

describe('play notes', () => {
  beforeEach(() => {
    useEditorStore.getState().reset()
  })

  it('updates play notes', () => {
    const store = useEditorStore.getState()
    store.addPlay('Test')
    store.setActivePlay(0)

    const playId = useEditorStore.getState().session.plays[0].id
    expect(useEditorStore.getState().session.plays[0].notes).toBeUndefined()

    store.updatePlayNotes(playId, 'Hello notes')
    expect(useEditorStore.getState().session.plays[0].notes).toBe('Hello notes')

    store.updatePlayNotes(playId, 'Updated notes')
    expect(useEditorStore.getState().session.plays[0].notes).toBe('Updated notes')
  })

  it('notes persist after adding elements', () => {
    const store = useEditorStore.getState()
    store.addPlay('Test')
    store.setActivePlay(0)
    store.setActiveStep(0)

    const playId = useEditorStore.getState().session.plays[0].id
    store.updatePlayNotes(playId, 'My notes')

    // Add an element — notes should still be there
    store.addElement({ id: 'p1', type: 'player', x: 50, y: 50, team: 'own', label: '7' })
    expect(useEditorStore.getState().session.plays[0].notes).toBe('My notes')
  })
})
