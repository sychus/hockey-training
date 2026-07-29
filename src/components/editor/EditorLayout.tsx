import { useCallback, useRef, useState, useEffect } from 'react'
import { Stage } from 'react-konva'
import { FieldRenderer } from '../field/FieldRenderer'
import { PlayListPanel } from './PlayListPanel'
import { StepNavigator } from './StepNavigator'
import { ElementToolbar } from './ElementToolbar'
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

  const { saving, lastSaved, error: saveError } = useAutoSave()
  const [previewMode, setPreviewMode] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
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

  const fieldHeight = Math.round(fieldWidth * FIELD.ASPECT_RATIO)

  const currentElements =
    activePlayIndex >= 0 && activeStepIndex >= 0
      ? (session.plays[activePlayIndex]?.steps[activeStepIndex]?.elements ?? [])
      : []

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      moveElement(id, x, y)
    },
    [moveElement],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId && document.activeElement === document.body) {
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
      <div className="fixed inset-0 z-50 bg-black">
        <button
          onClick={() => setPreviewMode(false)}
          className="absolute top-4 right-4 z-50 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
        >
          Cerrar vista previa
        </button>
        <SessionViewer session={session} />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-gray-950 min-h-screen">
      {/* Play list: collapsible bar on mobile, sidebar on desktop */}
      <PlayListPanel />

      {/* Centro: cancha + controles */}
      <div className="flex-1 flex flex-col gap-2 md:gap-3 items-center">
        <div className="w-full flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={session.title}
              onChange={(e) => useEditorStore.getState().updateSessionTitle(e.target.value)}
              className="bg-transparent text-white text-lg md:text-xl font-bold border-b border-gray-700 focus:border-blue-500 outline-none w-full pb-1"
            />
            <div className="text-xs mt-1">
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

        <ElementToolbar />

        <div ref={containerRef} className="w-full flex justify-center">
          {noPlaySelected ? (
            <div
              className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg text-gray-500 text-sm text-center p-4"
              style={{ width: fieldWidth, height: fieldHeight }}
            >
              Seleccioná o creá una jugada para empezar
            </div>
          ) : (
            <Stage width={fieldWidth} height={fieldHeight}>
              <FieldRenderer
                width={fieldWidth}
                height={fieldHeight}
                elements={currentElements}
                draggable
                onElementDragEnd={handleDragEnd}
                onElementSelect={selectElement}
              />
            </Stage>
          )}
        </div>

        <StepNavigator />
      </div>
    </div>
  )
}
