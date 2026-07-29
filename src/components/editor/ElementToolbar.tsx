import { useEditorStore } from '../../stores/editor-store'
import {
  createPlayer,
  createBall,
  createCone,
  createGoal,
  createMiniGoal,
  createHurdle,
  createArrow,
  createText,
} from '../../domain/factories'
import type { FieldElement } from '../../types'

interface Tool {
  label: string
  icon: string
  action: () => FieldElement
}

const TOOLS: Tool[] = [
  { label: 'Jugador propio', icon: '🟡', action: () => createPlayer({ x: 50, y: 50, team: 'own', label: '?' }) },
  { label: 'Jugador rival', icon: '🔴', action: () => createPlayer({ x: 50, y: 50, team: 'rival', label: '?' }) },
  { label: 'Pelota', icon: '⚪', action: () => createBall({ x: 50, y: 50 }) },
  { label: 'Cono', icon: '🔶', action: () => createCone({ x: 50, y: 50 }) },
  { label: 'Arco', icon: '🥅', action: () => createGoal({ x: 50, y: 10 }) },
  { label: 'Mini arco', icon: '▬', action: () => createMiniGoal({ x: 50, y: 50 }) },
  { label: 'Valla', icon: '━', action: () => createHurdle({ x: 50, y: 50 }) },
  { label: 'Movimiento', icon: '→', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'movement' }) },
  { label: 'Pase', icon: '⇢', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'pass' }) },
  { label: 'Tiro', icon: '⟶', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'shot' }) },
  { label: 'Conducción', icon: '〰', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'dribble' }) },
  { label: 'Opcional', icon: '⋯', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'optional' }) },
  { label: 'Texto', icon: 'T', action: () => createText({ x: 50, y: 50, content: 'Nota' }) },
]

export function ElementToolbar() {
  const addElement = useEditorStore((s) => s.addElement)
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)

  const disabled = activePlayIndex < 0 || activeStepIndex < 0

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-800 rounded-lg">
      {TOOLS.map((tool) => (
        <button
          key={tool.label}
          title={tool.label}
          disabled={disabled}
          onClick={() => addElement(tool.action())}
          className="w-10 h-10 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-lg"
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
