import type { ReactNode } from 'react'
import { useEditorStore } from '../../stores/editor-store'
import {
  createPlayer,
  createBall,
  createCone,
  createGoal,
  createHurdle,
  createArrow,
  createText,
} from '../../domain/factories'
import type { FieldElement } from '../../types'

interface Tool {
  label: string
  icon: ReactNode
  action: () => FieldElement
}

interface ToolGroup {
  title: string
  tools: Tool[]
}

/**
 * SVG player icon that matches the canvas PlayerToken:
 * head with hair + ponytails, colored jersey with label
 */
function PlayerIcon({ jerseyColor, label }: { jerseyColor: string; label: string }) {
  const darkJersey = jerseyColor === '#f5c542'
  const textColor = darkJersey ? '#1a1a00' : '#ffffff'
  const hairColor = '#5c3317'
  return (
    <svg width="24" height="28" viewBox="0 0 24 28">
      {/* Hair cap */}
      <ellipse cx="12" cy="6" rx="5" ry="3" fill={hairColor} />
      {/* Head */}
      <circle cx="12" cy="7" r="4" fill="#ffe0bd" stroke="#c4a882" strokeWidth="0.5" />
      {/* Ponytail left */}
      <path d="M8,6 Q5,12 6,15" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Ponytail right */}
      <path d="M16,6 Q19,12 18,15" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Jersey body */}
      <ellipse cx="12" cy="19" rx="8" ry="7" fill={jerseyColor} stroke={darkJersey ? '#c8a000' : '#16a34a'} strokeWidth="1" />
      {/* Label on jersey */}
      <text x="12" y="21" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>{label}</text>
    </svg>
  )
}

function ArrowIcon({ color, dash }: { color: string; dash?: boolean }) {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14">
      <line
        x1="2" y1="7" x2="16" y2="7"
        stroke={color} strokeWidth="2"
        strokeDasharray={dash ? '4 2' : undefined}
      />
      <polygon points="15,3 21,7 15,11" fill={color} />
    </svg>
  )
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    title: 'Jugadoras',
    tools: [
      { label: 'Jugadora propia', icon: <PlayerIcon jerseyColor="#f5c542" label="P" />, action: () => createPlayer({ x: 50, y: 50, team: 'own', label: '?' }) },
      { label: 'Jugadora rival', icon: <PlayerIcon jerseyColor="#22c55e" label="R" />, action: () => createPlayer({ x: 50, y: 50, team: 'rival', label: '?' }) },
    ],
  },
  {
    title: 'Elementos',
    tools: [
      { label: 'Pelota', icon: <span className="w-4 h-4 rounded-full bg-white border border-gray-400 inline-block" />, action: () => createBall({ x: 50, y: 50 }) },
      { label: 'Cono', icon: <span className="text-orange-500 text-lg leading-none">▲</span>, action: () => createCone({ x: 50, y: 50 }) },
      { label: 'Arco', icon: <span className="text-white text-base leading-none font-bold">⊓</span>, action: () => createGoal({ x: 50, y: 10 }) },
      { label: 'Valla', icon: <span className="text-red-400 text-lg leading-none">▬</span>, action: () => createHurdle({ x: 50, y: 50 }) },
    ],
  },
  {
    title: 'Flechas',
    tools: [
      { label: 'Movimiento', icon: <ArrowIcon color="#ffffff" />, action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'movement' }) },
      { label: 'Pase', icon: <ArrowIcon color="#00bfff" dash />, action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'pass' }) },
      { label: 'Tiro', icon: <ArrowIcon color="#ff4444" />, action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'shot' }) },
      { label: 'Conducción', icon: <ArrowIcon color="#ffd700" dash />, action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'dribble' }) },
      { label: 'Opcional', icon: <ArrowIcon color="#aaaaaa" dash />, action: () => createArrow({ x: 40, y: 50, toX: 60, toY: 50, style: 'optional' }) },
    ],
  },
  {
    title: 'Texto',
    tools: [
      { label: 'Texto', icon: <span className="text-white font-bold text-sm">T</span>, action: () => createText({ x: 50, y: 50, content: 'Nota' }) },
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
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {tool.icon}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
