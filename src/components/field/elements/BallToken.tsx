import { Circle, Group } from 'react-konva'
import { COLORS, ELEMENT_SIZES } from '../../../lib/constants'
import type { BallElement } from '../../../types'

interface BallTokenProps {
  element: BallElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function BallToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: BallTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const radius = (ELEMENT_SIZES.ballRadius / 100) * fieldWidth

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onDragEnd={(e) => {
        const newX = (e.target.x() / fieldWidth) * 100
        const newY = (e.target.y() / fieldHeight) * 100
        onDragEnd?.(element.id, newX, newY)
      }}
      onClick={() => onSelect?.(element.id)}
      onTap={() => onSelect?.(element.id)}
    >
      <Circle radius={radius} fill={COLORS.ball} stroke={COLORS.ballOutline} strokeWidth={1.5} />
    </Group>
  )
}
