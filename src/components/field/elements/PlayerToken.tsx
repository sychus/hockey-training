import { Circle, Text, Group } from 'react-konva'
import { COLORS, ELEMENT_SIZES } from '../../../lib/constants'
import type { PlayerElement } from '../../../types'

interface PlayerTokenProps {
  element: PlayerElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
}

export function PlayerToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  onDragEnd,
  onSelect,
}: PlayerTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const radius = (ELEMENT_SIZES.playerRadius / 100) * fieldWidth
  const color = element.team === 'own' ? COLORS.ownTeam : COLORS.rivalTeam

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
      <Circle radius={radius} fill={color} stroke="#000" strokeWidth={1} />
      <Text
        text={element.label}
        fontSize={radius * 0.9}
        fill="#000"
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        offsetX={radius * 0.5}
        offsetY={radius * 0.4}
        width={radius}
      />
    </Group>
  )
}
