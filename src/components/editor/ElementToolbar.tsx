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

interface ToolGroup {
  title: string
  tools: { label: string; icon: string; color?: string; action: () => FieldElement }[]
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    title: 'Jugadoras',
    tools: [
      { label: 'Jugadora propia', icon: '👤', color: '#f5c542', action: () => createPlayer({ x: 50, y: 50, team: 'own', label: '?' }) },
      { label: 'Jugadora rival', icon: '👤', color: '#22c55e', action: () => createPlayer({ x: 50, y: 50, team: 'rival', label: '?' }) },
    ],
  },
  {
    title: 'Elementos',
    tools: [
      { label: 'Pelota', icon: '🏑', action: () => createBall({ x: 50, y: 50 }) },
      { label: 'Cono', icon: '🔶', action: () => createCone({ x: 50, y: 50 }) },
      { label: 'Arco', icon: '🥅', action: () => createGoal({ x: 50, y: 10 }) },
      { label: 'Mini arco', icon: '⊓', action: () => createMiniGoal({ x: 50, y: 50 }) },
      { label: 'Valla', icon: '▭', action: () => createHurdle({ x: 50, y: 50 }) },
    ],
  },
  {
    title: 'Flechas',
    tools: [
      { label: 'Movimiento', icon: '→', color: '#ffffff', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'movement' }) },
      { label: 'Pase', icon: '⇢', color: '#00bfff', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'pass' }) },
      { label: 'Tiro', icon: '⟶', color: '#ff4444', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'shot' }) },
      { label: 'Conducción', icon: '〰', color: '#ffd700', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'dribble' }) },
      { label: 'Opcional', icon: '⋯', color: '#aaaaaa', action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'optional' }) },
    ],
  },
  {
    title: 'Texto',
    tools: [
      { label: 'Texto', icon: 'T', action: () => createText({ x: 50, y: 50, content: 'Nota' }) },
    ],
  },
]

export function ElementToolbar() {
  const addElement = useEditorStore((s) => s.addElement)
  const activePlayIndex = useEditorStore((s) => s.activePlayIndex)
  const activeStepIndex = useEditorStore((s) => s.activeStepIndex)

  const disabled = activePlayIndex < 0 || activeStepIndex < 0

  return (
    <div className="flex flex-wrap gap-1 p-1.5 md:p-2 bg-gray-800 rounded-lg w-full justify-center items-center">
      {TOOL_GROUPS.map((group, gi) => (
        <div key={group.title} className="flex items-center gap-1">
          {gi > 0 && <div className="w-px h-6 bg-gray-600 mx-0.5" />}
          {group.tools.map((tool) => (
            <button
              key={tool.label}
              title={tool.label}
              disabled={disabled}
              onClick={() => addElement(tool.action())}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-base md:text-lg"
              style={tool.color ? { color: tool.color } : undefined}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
