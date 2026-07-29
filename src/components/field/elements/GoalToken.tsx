import { Rect, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { GoalElement, MiniGoalElement } from '../../../types'

interface GoalTokenProps {
  element: GoalElement | MiniGoalElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function GoalToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: GoalTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const isMini = element.type === 'mini-goal'
  const goalW = fieldWidth * (isMini ? 0.05 : 0.08)
  const goalH = fieldWidth * (isMini ? 0.02 : 0.03)

  return (
    <Group
      x={x}
      y={y}
      rotation={element.rotation}
      draggable={draggable}
      onDragEnd={(e) => {
        const newX = (e.target.x() / fieldWidth) * 100
        const newY = (e.target.y() / fieldHeight) * 100
        onDragEnd?.(element.id, newX, newY)
      }}
      onClick={() => onSelect?.(element.id)}
      onTap={() => onSelect?.(element.id)}
    >
      <Rect
        offsetX={goalW / 2}
        offsetY={goalH / 2}
        width={goalW}
        height={goalH}
        fill="transparent"
        stroke={COLORS.goal}
        strokeWidth={2}
      />
    </Group>
  )
}
