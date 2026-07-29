import { Arrow, Circle, Line, Group } from 'react-konva'
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

  // Relative end point from the group origin (fromX, fromY)
  const relToX = toX - fromX
  const relToY = toY - fromY

  return (
    <Group>
      {/* Draggable group wrapping the arrow — moves the whole arrow */}
      <Group
        x={fromX}
        y={fromY}
        draggable={draggable}
        onDragEnd={(e) => {
          const newX = (e.target.x() / fieldWidth) * 100
          const newY = (e.target.y() / fieldHeight) * 100
          onDragEnd?.(element.id, newX, newY)
        }}
        onClick={() => onSelect?.(element.id)}
        onTap={() => onSelect?.(element.id)}
      >
        <Arrow
          points={[0, 0, relToX, relToY]}
          stroke={config.color}
          strokeWidth={selected ? 3.5 : 2.5}
          fill={config.color}
          pointerLength={8}
          pointerWidth={6}
          dash={config.dash}
          hitStrokeWidth={20}
        />
      </Group>

      {/* Endpoint handles — only when selected */}
      {selected && draggable && (
        <>
          {/* Start handle (blue) — moves start point only */}
          <Circle
            x={fromX}
            y={fromY}
            radius={HANDLE_RADIUS}
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth={2}
            draggable
            onDragEnd={(e) => {
              const newX = (e.target.x() / fieldWidth) * 100
              const newY = (e.target.y() / fieldHeight) * 100
              onUpdate?.(element.id, { x: newX, y: newY })
            }}
          />
          {/* Dashed line showing the connection */}
          <Line
            points={[fromX, fromY, toX, toY]}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
          {/* End handle (red) — changes direction/length */}
          <Circle
            x={toX}
            y={toY}
            radius={HANDLE_RADIUS}
            fill="#ef4444"
            stroke="#fff"
            strokeWidth={2}
            draggable
            onDragEnd={(e) => {
              const newToX = (e.target.x() / fieldWidth) * 100
              const newToY = (e.target.y() / fieldHeight) * 100
              onUpdate?.(element.id, { toX: newToX, toY: newToY })
            }}
          />
        </>
      )}
    </Group>
  )
}
