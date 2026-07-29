import { useEditorStore } from '../../stores/editor-store'
import { LimitIndicator } from '../ui/LimitIndicator'
import { MAX_STEPS_PER_PLAY } from '../../lib/constants'

export function StepNavigator() {
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)
  const plays = useEditorStore((s) => s.session.plays)
  const setActiveStep = useEditorStore((s) => s.setActiveStep)
  const addStep = useEditorStore((s) => s.addStep)
  const removeStep = useEditorStore((s) => s.removeStep)
  const duplicateStep = useEditorStore((s) => s.duplicateStep)

  if (activePlayIndex < 0) return null

  const play = plays[activePlayIndex]
  if (!play) return null

  const totalSteps = play.steps.length

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
      <button
        disabled={activeStepIndex <= 0}
        onClick={() => setActiveStep(activeStepIndex - 1)}
        className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white"
      >
        ◀
      </button>

      <span className="text-white text-sm min-w-[80px] text-center">
        Paso {activeStepIndex + 1} / {totalSteps}
      </span>

      <button
        disabled={activeStepIndex >= totalSteps - 1}
        onClick={() => setActiveStep(activeStepIndex + 1)}
        className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white"
      >
        ▶
      </button>

      <div className="border-l border-gray-600 pl-2 ml-2 flex gap-1">
        <button
          disabled={totalSteps >= MAX_STEPS_PER_PLAY}
          onClick={addStep}
          className="px-2 py-1 rounded bg-green-700 hover:bg-green-600 text-white text-sm disabled:opacity-30"
          title="Agregar paso"
        >
          +
        </button>

        <button
          disabled={activeStepIndex < 0}
          onClick={() => duplicateStep(activeStepIndex)}
          className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm disabled:opacity-30"
          title="Duplicar paso actual"
        >
          ⧉
        </button>

        <button
          disabled={totalSteps <= 1}
          onClick={() => {
            const stepId = play.steps[activeStepIndex]?.id
            if (stepId) removeStep(stepId)
          }}
          className="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-sm disabled:opacity-30"
          title="Eliminar paso"
        >
          ✕
        </button>
      </div>

      <div className="ml-auto">
        <LimitIndicator current={totalSteps} max={MAX_STEPS_PER_PLAY} label="Pasos" />
      </div>
    </div>
  )
}
