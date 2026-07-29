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
  const isOwn = element.team === 'own'
  const fillColor = isOwn ? COLORS.ownTeam : COLORS.rivalTeam
  const strokeColor = isOwn ? '#c8a000' : '#a82020'
  const textColor = isOwn ? '#1a1a00' : '#ffffff'

  const fontSize = Math.max(radius * 1.1, 8)

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
      {/* Outer glow for visibility on green */}
      <Circle
        radius={radius + 2}
        fill="transparent"
        stroke={isOwn ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
        strokeWidth={1}
      />
      {/* Main body */}
      <Circle
        radius={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />
      {/* Label */}
      <Text
        text={element.label}
        fontSize={fontSize}
        fill={textColor}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        width={radius * 2}
        height={radius * 2}
        offsetX={radius}
        offsetY={radius}
      />
    </Group>
  )
}
