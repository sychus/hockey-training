import { create } from 'zustand'
import type { Session, FieldElement } from '../types'
import { createSession, createPlay, createStep } from '../domain/factories'
import { canAddPlay, canAddStep } from '../domain/validation'

interface EditorState {
  session: Session
  activePlayIndex: number
  activeStepIndex: number
  selectedElementId: string | null

  // Session
  setSession: (session: Session) => void
  updateSessionTitle: (title: string) => void
  updateSessionDescription: (description: string) => void

  // Plays
  addPlay: (title: string) => void
  removePlay: (playId: string) => void
  reorderPlays: (fromIndex: number, toIndex: number) => void
  updatePlayTitle: (playId: string, title: string) => void
  updatePlayNotes: (playId: string, notes: string) => void

  // Steps
  addStep: () => void
  removeStep: (stepId: string) => void
  duplicateStep: (stepIndex: number) => void

  // Elements
  addElement: (element: FieldElement) => void
  moveElement: (elementId: string, x: number, y: number) => void
  removeElement: (elementId: string) => void
  updateElement: (elementId: string, updates: Partial<FieldElement>) => void

  // Navigation
  setActivePlay: (index: number) => void
  setActiveStep: (index: number) => void
  selectElement: (id: string | null) => void

  // Reset
  reset: () => void
}

const initialSession = createSession({ title: 'Nueva Sesión' })

export const useEditorStore = create<EditorState>((set, _get) => ({
  session: initialSession,
  activePlayIndex: -1,
  activeStepIndex: -1,
  selectedElementId: null,

  setSession: (session) =>
    set({ session, activePlayIndex: -1, activeStepIndex: -1, selectedElementId: null }),

  updateSessionTitle: (title) =>
    set((state) => ({
      session: { ...state.session, title, updatedAt: new Date().toISOString() },
    })),

  updateSessionDescription: (description) =>
    set((state) => ({
      session: { ...state.session, description, updatedAt: new Date().toISOString() },
    })),

  // === Plays ===
  addPlay: (title) =>
    set((state) => {
      if (!canAddPlay(state.session)) return state
      const play = createPlay({ title })
      return {
        session: {
          ...state.session,
          plays: [...state.session.plays, play],
          updatedAt: new Date().toISOString(),
        },
      }
    }),

  removePlay: (playId) =>
    set((state) => {
      const plays = state.session.plays.filter((p) => p.id !== playId)
      const newActivePlayIndex =
        state.activePlayIndex >= plays.length ? plays.length - 1 : state.activePlayIndex
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        activePlayIndex: newActivePlayIndex,
        activeStepIndex: -1,
        selectedElementId: null,
      }
    }),

  reorderPlays: (fromIndex, toIndex) =>
    set((state) => {
      const plays = [...state.session.plays]
      const [moved] = plays.splice(fromIndex, 1)
      plays.splice(toIndex, 0, moved)
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  updatePlayTitle: (playId, title) =>
    set((state) => ({
      session: {
        ...state.session,
        plays: state.session.plays.map((p) => (p.id === playId ? { ...p, title } : p)),
        updatedAt: new Date().toISOString(),
      },
    })),

  updatePlayNotes: (playId, notes) =>
    set((state) => ({
      session: {
        ...state.session,
        plays: state.session.plays.map((p) => (p.id === playId ? { ...p, notes } : p)),
        updatedAt: new Date().toISOString(),
      },
    })),

  // === Steps ===
  addStep: () =>
    set((state) => {
      const { activePlayIndex } = state
      if (activePlayIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      if (!canAddStep(play)) return state
      const step = createStep()
      const updatedPlay = { ...play, steps: [...play.steps, step] }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  removeStep: (stepId) =>
    set((state) => {
      const { activePlayIndex } = state
      if (activePlayIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      if (play.steps.length <= 1) return state
      const steps = play.steps.filter((s) => s.id !== stepId)
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      const newActiveStepIndex =
        state.activeStepIndex >= steps.length ? steps.length - 1 : state.activeStepIndex
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        activeStepIndex: newActiveStepIndex,
        selectedElementId: null,
      }
    }),

  duplicateStep: (stepIndex) =>
    set((state) => {
      const { activePlayIndex } = state
      if (activePlayIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      if (!canAddStep(play)) return state
      const sourceStep = play.steps[stepIndex]
      if (!sourceStep) return state
      const newStep = {
        ...createStep(),
        elements: sourceStep.elements.map((el) => ({ ...el })),
      }
      const steps = [...play.steps]
      steps.splice(stepIndex + 1, 0, newStep)
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        activeStepIndex: stepIndex + 1,
      }
    }),

  // === Elements ===
  addElement: (element) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const updatedStep = { ...step, elements: [...step.elements, element] }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  moveElement: (elementId, x, y) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const elements = step.elements.map((el) => (el.id === elementId ? { ...el, x, y } : el))
      const updatedStep = { ...step, elements }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  removeElement: (elementId) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const elements = step.elements.filter((el) => el.id !== elementId)
      const updatedStep = { ...step, elements }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
        selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
      }
    }),

  updateElement: (elementId, updates) =>
    set((state) => {
      const { activePlayIndex, activeStepIndex } = state
      if (activePlayIndex < 0 || activeStepIndex < 0) return state
      const play = state.session.plays[activePlayIndex]
      const step = play.steps[activeStepIndex]
      const elements = step.elements.map((el) =>
        el.id === elementId ? ({ ...el, ...updates } as FieldElement) : el,
      )
      const updatedStep = { ...step, elements }
      const steps = play.steps.map((s, i) => (i === activeStepIndex ? updatedStep : s))
      const updatedPlay = { ...play, steps }
      const plays = state.session.plays.map((p, i) => (i === activePlayIndex ? updatedPlay : p))
      return {
        session: { ...state.session, plays, updatedAt: new Date().toISOString() },
      }
    }),

  // === Navigation ===
  setActivePlay: (index) =>
    set({ activePlayIndex: index, activeStepIndex: index >= 0 ? 0 : -1, selectedElementId: null }),

  setActiveStep: (index) => set({ activeStepIndex: index, selectedElementId: null }),

  selectElement: (id) => set({ selectedElementId: id }),

  // === Reset ===
  reset: () =>
    set({
      session: createSession({ title: 'Nueva Sesión' }),
      activePlayIndex: -1,
      activeStepIndex: -1,
      selectedElementId: null,
    }),
}))
