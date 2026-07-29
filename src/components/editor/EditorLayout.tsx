import { useCallback, useRef, useState, useEffect } from 'react'
import { Stage } from 'react-konva'
import Konva from 'konva'
import { FieldRenderer } from '../field/FieldRenderer'
import { PlayListPanel } from './PlayListPanel'
import { StepNavigator } from './StepNavigator'
import { ElementToolbar } from './ElementToolbar'
import { SelectedElementActions } from './SelectedElementActions'
import { SessionViewer } from '../viewer/SessionViewer'
import { useEditorStore } from '../../stores/editor-store'
import { useAutoSave } from '../../hooks/useAutoSave'
import { FIELD } from '../../lib/constants'

export function EditorLayout() {
  const session = useEditorStore((s) => s.session)
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)
  const moveElement = useEditorStore((s) => s.moveElement)
  const selectElement = useEditorStore((s) => s.selectElement)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const removeElement = useEditorStore((s) => s.removeElement)
  const updateElement = useEditorStore((s) => s.updateElement)
  const setLastTapPosition = useEditorStore((s) => s.setLastTapPosition)

  const { saving, lastSaved, error: saveError } = useAutoSave()
  const [previewMode, setPreviewMode] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [fieldWidth, setFieldWidth] = useState(350)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth
        setFieldWidth(Math.min(available, 600))
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Mobile scroll fix: Konva calls preventDefault() on ALL touch events,
  // which blocks page scrolling. We override Konva's internal handler to
  // only preventDefault when the touch is on a draggable element.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const content = stage.content
    if (!content) return

    // Konva adds its touchstart/touchmove handlers to stage.content.
    // We add our own handler BEFORE Konva's (capture phase) to cancel
    // Konva's preventDefault for touches on empty areas.
    const handleTouchMove = (e: TouchEvent) => {
      // If Konva is actively dragging something, let it preventDefault
      if (Konva.isDragging()) return
      // Otherwise, stop Konva from blocking the scroll
      e.stopImmediatePropagation()
    }

    content.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true })

    return () => {
      content.removeEventListener('touchmove', handleTouchMove, { capture: true } as EventListenerOptions)
    }
  })

  const fieldHeight = Math.round(fieldWidth * FIELD.ASPECT_RATIO)

  const currentElements =
    activePlayIndex >= 0 && activeStepIndex >= 0
      ? (session.plays[activePlayIndex]?.steps[activeStepIndex]?.elements ?? [])
      : []

  const selectedElement = selectedElementId
    ? currentElements.find((el) => el.id === selectedElementId) ?? null
    : null

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      moveElement(id, x, y)
    },
    [moveElement],
  )

  // Keyboard delete — only when focus is NOT in an input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (document.activeElement?.tagName ?? '').toLowerCase()
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return
        if (selectedElementId) {
          e.preventDefault()
          removeElement(selectedElementId)
        }
      }
    },
    [selectedElementId, removeElement],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const noPlaySelected = activePlayIndex < 0

  if (previewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
        <div className="bg-blue-900 px-4 py-2 flex items-center justify-between shrink-0">
          <span className="text-blue-200 text-xs md:text-sm">
            Vista previa — Asi lo van a ver los jugadores
          </span>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >
            Volver al editor
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <SessionViewer session={session} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 bg-gray-950 min-h-screen">
      {/* Play list */}
      <PlayListPanel />

      {/* Center: field + controls */}
      <div className="flex-1 flex flex-col gap-1.5 md:gap-3 items-center">
        {/* Title row */}
        <div className="w-full flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={session.title}
              onChange={(e) => useEditorStore.getState().updateSessionTitle(e.target.value)}
              className="bg-transparent text-white text-lg md:text-xl font-bold border-b border-gray-700 focus:border-blue-500 outline-none w-full pb-1"
            />
            <div className="text-xs mt-0.5">
              {saveError ? (
                <span className="text-red-400">{saveError}</span>
              ) : saving ? (
                <span className="text-gray-500">Guardando...</span>
              ) : lastSaved ? (
                <span className="text-gray-500">
                  Guardado {lastSaved.toLocaleTimeString('es-AR')}
                </span>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setPreviewMode(true)}
            disabled={session.plays.length === 0}
            className="px-2 py-1 md:px-3 rounded bg-purple-700 hover:bg-purple-600 text-white text-xs md:text-sm disabled:opacity-30 shrink-0"
          >
            Vista jugador
          </button>
        </div>

        {/* Toolbar */}
        <ElementToolbar />

        {/* Field canvas */}
        <div ref={containerRef} className="w-full flex justify-center">
          {noPlaySelected ? (
            <div
              className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg text-gray-500 text-sm text-center p-4"
              style={{ width: fieldWidth, height: fieldHeight }}
            >
              Seleccioná o creá una jugada para empezar
            </div>
          ) : (
            <Stage
              ref={stageRef}
              width={fieldWidth}
              height={fieldHeight}
              onClick={(e) => {
                const pos = e.target.getStage()?.getPointerPosition()
                if (pos) {
                  setLastTapPosition(
                    (pos.x / fieldWidth) * 100,
                    (pos.y / fieldHeight) * 100,
                  )
                }
              }}
              onTap={(e) => {
                const pos = e.target.getStage()?.getPointerPosition()
                if (pos) {
                  setLastTapPosition(
                    (pos.x / fieldWidth) * 100,
                    (pos.y / fieldHeight) * 100,
                  )
                }
              }}
            >
              <FieldRenderer
                width={fieldWidth}
                height={fieldHeight}
                elements={currentElements}
                draggable
                selectedElementId={selectedElementId}
                onElementDragEnd={handleDragEnd}
                onElementSelect={selectElement}
                onElementUpdate={updateElement}
              />
            </Stage>
          )}
        </div>

        {/* Contextual actions for selected element */}
        <SelectedElementActions
          element={selectedElement}
          onDelete={(id) => removeElement(id)}
          onUpdate={(id, updates) => updateElement(id, updates)}
          onDeselect={() => selectElement(null)}
        />

        {/* Step navigator */}
        <StepNavigator />

        {/* Play notes */}
        {!noPlaySelected && <PlayNotes />}
      </div>
    </div>
  )
}

function PlayNotes() {
  const play = useEditorStore((s) =>
    s.activePlayIndex >= 0 ? s.session.plays[s.activePlayIndex] : null,
  )
  const updatePlayNotes = useEditorStore((s) => s.updatePlayNotes)
  const [localNotes, setLocalNotes] = useState('')
  const [currentPlayId, setCurrentPlayId] = useState<string | null>(null)

  useEffect(() => {
    if (play && play.id !== currentPlayId) {
      setLocalNotes(play.notes ?? '')
      setCurrentPlayId(play.id)
    }
  }, [play, currentPlayId])

  if (!play) return null

  return (
    <div className="w-full">
      <textarea
        value={localNotes}
        onChange={(e) => {
          setLocalNotes(e.target.value)
          updatePlayNotes(play.id, e.target.value)
        }}
        placeholder="Notas tacticas de esta jugada..."
        rows={2}
        className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300 text-sm placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
    </div>
  )
}
