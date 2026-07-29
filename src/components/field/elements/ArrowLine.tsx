import { Arrow, Circle, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { ArrowElement } from '../../../types'

interface ArrowLineProps {
  element: ArrowElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  selected?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<ArrowElement>) => void
}

const ARROW_STYLE_CONFIG: Record<ArrowElement['style'], { color: string; dash?: number[] }> = {
  movement: { color: COLORS.arrowMovement },
  pass: { color: COLORS.arrowPass, dash: [10, 5] },
  shot: { color: COLORS.arrowShot, dash: [3, 3] },
  dribble: { color: COLORS.arrowDribble, dash: [8, 4, 2, 4] },
  optional: { color: COLORS.arrowOptional, dash: [5, 5] },
}

const HANDLE_RADIUS = 7
const HANDLE_COLOR = '#3b82f6'

export function ArrowLine({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  selected = false,
  onDragEnd,
  onSelect,
  onUpdate,
}: ArrowLineProps) {
  const fromX = (element.x / 100) * fieldWidth
  const fromY = (element.y / 100) * fieldHeight
  const toX = (element.toX / 100) * fieldWidth
  const toY = (element.toY / 100) * fieldHeight

  const config = ARROW_STYLE_CONFIG[element.style]

  return (
    <Group>
      {/* The arrow line itself — not draggable directly, use handles */}
      <Arrow
        points={[fromX, fromY, toX, toY]}
        stroke={config.color}
        strokeWidth={selected ? 3.5 : 2.5}
        fill={config.color}
        pointerLength={8}
        pointerWidth={6}
        dash={config.dash}
        hitStrokeWidth={20}
        onClick={() => onSelect?.(element.id)}
        onTap={() => onSelect?.(element.id)}
      />

      {/* Drag handles — only visible when selected AND in edit mode */}
      {selected && draggable && (
        <>
          {/* Start handle — moves the whole arrow */}
          <Circle
            x={fromX}
            y={fromY}
            radius={HANDLE_RADIUS}
            fill={HANDLE_COLOR}
            stroke="#fff"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              const newX = (e.target.x() / fieldWidth) * 100
              const newY = (e.target.y() / fieldHeight) * 100
              onUpdate?.(element.id, { x: newX, y: newY })
            }}
            onDragEnd={(e) => {
              const newX = (e.target.x() / fieldWidth) * 100
              const newY = (e.target.y() / fieldHeight) * 100
              onUpdate?.(element.id, { x: newX, y: newY })
            }}
          />
          {/* End handle — changes direction/length */}
          <Circle
            x={toX}
            y={toY}
            radius={HANDLE_RADIUS}
            fill="#ef4444"
            stroke="#fff"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              const newToX = (e.target.x() / fieldWidth) * 100
              const newToY = (e.target.y() / fieldHeight) * 100
              onUpdate?.(element.id, { toX: newToX, toY: newToY })
            }}
            onDragEnd={(e) => {
              const newToX = (e.target.x() / fieldWidth) * 100
              const newToY = (e.target.y() / fieldHeight) * 100
              onUpdate?.(element.id, { toX: newToX, toY: newToY })
            }}
          />
        </>
      )}

      {/* When NOT selected but draggable, invisible grab area at midpoint */}
      {!selected && draggable && (
        <Circle
          x={(fromX + toX) / 2}
          y={(fromY + toY) / 2}
          radius={12}
          fill="transparent"
          draggable
          onDragEnd={(e) => {
            // Move the whole arrow by delta from midpoint
            const midX = (fromX + toX) / 2
            const midY = (fromY + toY) / 2
            const dx = e.target.x() - midX
            const dy = e.target.y() - midY
            const newX = element.x + (dx / fieldWidth) * 100
            const newY = element.y + (dy / fieldHeight) * 100
            // Reset the circle position (it moved in pixel space)
            e.target.x(midX)
            e.target.y(midY)
            onDragEnd?.(element.id, newX, newY)
          }}
          onClick={() => onSelect?.(element.id)}
          onTap={() => onSelect?.(element.id)}
        />
      )}
    </Group>
  )
}
