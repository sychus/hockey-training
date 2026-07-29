import { RegularPolygon, Group } from 'react-konva'
import { COLORS, ELEMENT_SIZES } from '../../../lib/constants'
import type { ConeElement } from '../../../types'

interface ConeTokenProps {
  element: ConeElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function ConeToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: ConeTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const size = (ELEMENT_SIZES.coneSize / 100) * fieldWidth

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
      <RegularPolygon sides={3} radius={size} fill={COLORS.cone} stroke="#000" strokeWidth={1} />
    </Group>
  )
}
