import { Arrow, Circle, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { ArrowElement } from '../../../types'

interface ArrowLineProps {
  element: ArrowElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

const ARROW_STYLE_CONFIG: Record<ArrowElement['style'], { color: string; dash?: number[] }> = {
  movement: { color: COLORS.arrowMovement },
  pass: { color: COLORS.arrowPass, dash: [10, 5] },
  shot: { color: COLORS.arrowShot, dash: [3, 3] },
  dribble: { color: COLORS.arrowDribble, dash: [8, 4, 2, 4] },
  optional: { color: COLORS.arrowOptional, dash: [5, 5] },
}

export function ArrowLine({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: ArrowLineProps) {
  const fromX = (element.x / 100) * fieldWidth
  const fromY = (element.y / 100) * fieldHeight
  const toX = (element.toX / 100) * fieldWidth
  const toY = (element.toY / 100) * fieldHeight

  const config = ARROW_STYLE_CONFIG[element.style]

  const relToX = toX - fromX
  const relToY = toY - fromY

  return (
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
      {/* Invisible hit area at the start point for easier grabbing */}
      {draggable && <Circle radius={10} fill="transparent" />}
      <Arrow
        points={[0, 0, relToX, relToY]}
        stroke={config.color}
        strokeWidth={2.5}
        fill={config.color}
        pointerLength={8}
        pointerWidth={6}
        dash={config.dash}
        hitStrokeWidth={16}
      />
    </Group>
  )
}
