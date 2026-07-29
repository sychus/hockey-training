import { Rect, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { HurdleElement } from '../../../types'

interface HurdleTokenProps {
  element: HurdleElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function HurdleToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: HurdleTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const w = fieldWidth * 0.06
  const h = fieldWidth * 0.015

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
        offsetX={w / 2}
        offsetY={h / 2}
        width={w}
        height={h}
        fill={COLORS.hurdle}
        stroke="#000"
        strokeWidth={1}
      />
    </Group>
  )
}
