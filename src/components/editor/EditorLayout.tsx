import { useCallback, useRef, useState, useEffect } from 'react'
import { Stage } from 'react-konva'
import { FieldRenderer } from '../field/FieldRenderer'
import { PlayListPanel } from './PlayListPanel'
import { StepNavigator } from './StepNavigator'
import { ElementToolbar } from './ElementToolbar'
import { useEditorStore } from '../../stores/editor-store'
import { FIELD } from '../../lib/constants'

export function EditorLayout() {
  const session = useEditorStore((s) => s.session)
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)
  const moveElement = useEditorStore((s) => s.moveElement)
  const selectElement = useEditorStore((s) => s.selectElement)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const removeElement = useEditorStore((s) => s.removeElement)

  const containerRef = useRef<HTMLDivElement>(null)
  const [fieldWidth, setFieldWidth] = useState(500)

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

  return (
    <div className="flex gap-4 p-4 bg-gray-950 min-h-screen">
      {/* Panel izquierdo: lista de jugadas */}
      <PlayListPanel />

      {/* Centro: cancha + controles */}
      <div className="flex-1 flex flex-col gap-3 items-center">
        <div className="w-full">
          <input
            type="text"
            value={session.title}
            onChange={(e) => useEditorStore.getState().updateSessionTitle(e.target.value)}
            className="bg-transparent text-white text-xl font-bold border-b border-gray-700 focus:border-blue-500 outline-none w-full pb-1"
          />
        </div>

        <ElementToolbar />

        <div ref={containerRef} className="w-full flex justify-center">
          {noPlaySelected ? (
            <div
              className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg text-gray-500"
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
