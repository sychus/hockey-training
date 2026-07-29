import { Circle, Line, Text, Group } from 'react-konva'
import { ELEMENT_SIZES } from '../../../lib/constants'
import type { PlayerElement } from '../../../types'

// Team colors: own = yellow jersey, rival = green jersey
const TEAM_STYLES = {
  own: {
    jersey: '#f5c542',
    jerseyStroke: '#c8a000',
    head: '#ffe0bd',
    hair: '#5c3317',
    text: '#1a1a00',
  },
  rival: {
    jersey: '#22c55e',
    jerseyStroke: '#16a34a',
    head: '#ffe0bd',
    hair: '#1a1a2e',
    text: '#ffffff',
  },
} as const

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
  const r = (ELEMENT_SIZES.playerRadius / 100) * fieldWidth
  const style = TEAM_STYLES[element.team]

  // Proportions relative to the radius
  const headR = r * 0.45
  const bodyW = r * 1.4
  const bodyH = r * 1.0
  const headY = -r * 0.5
  const bodyY = r * 0.15
  const tailLen = r * 0.55
  const fontSize = Math.max(r * 0.7, 7)

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
      {/* Jersey / body — rounded rectangle */}
      <Circle
        x={0}
        y={bodyY}
        radius={bodyW / 2}
        fill={style.jersey}
        stroke={style.jerseyStroke}
        strokeWidth={1.5}
        scaleY={bodyH / bodyW}
      />

      {/* Number on jersey */}
      <Text
        text={element.label}
        fontSize={fontSize}
        fill={style.text}
        fontStyle="bold"
        align="center"
        verticalAlign="middle"
        width={bodyW}
        height={bodyH}
        offsetX={bodyW / 2}
        offsetY={bodyH / 2 - bodyY}
      />

      {/* Head */}
      <Circle
        x={0}
        y={headY}
        radius={headR}
        fill={style.head}
        stroke="#c4a882"
        strokeWidth={1}
      />

      {/* Hair on top */}
      <Circle
        x={0}
        y={headY - headR * 0.3}
        radius={headR * 0.85}
        fill={style.hair}
        scaleY={0.6}
      />

      {/* Ponytail left */}
      <Line
        points={[
          -headR * 0.5, headY - headR * 0.1,
          -headR * 1.1, headY + tailLen,
          -headR * 0.9, headY + tailLen + tailLen * 0.2,
        ]}
        stroke={style.hair}
        strokeWidth={r * 0.18}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
      />

      {/* Ponytail right */}
      <Line
        points={[
          headR * 0.5, headY - headR * 0.1,
          headR * 1.1, headY + tailLen,
          headR * 0.9, headY + tailLen + tailLen * 0.2,
        ]}
        stroke={style.hair}
        strokeWidth={r * 0.18}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
      />
    </Group>
  )
}
