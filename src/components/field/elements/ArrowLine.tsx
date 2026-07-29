import { Arrow } from 'react-konva'
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
  onSelect,
}: ArrowLineProps) {
  const fromX = (element.x / 100) * fieldWidth
  const fromY = (element.y / 100) * fieldHeight
  const toX = (element.toX / 100) * fieldWidth
  const toY = (element.toY / 100) * fieldHeight

  const config = ARROW_STYLE_CONFIG[element.style]

  return (
    <Arrow
      points={[fromX, fromY, toX, toY]}
      stroke={config.color}
      strokeWidth={2}
      fill={config.color}
      pointerLength={8}
      pointerWidth={6}
      dash={config.dash}
      onClick={() => onSelect?.(element.id)}
      onTap={() => onSelect?.(element.id)}
    />
  )
}
