import { Rect, Circle, Group } from 'react-konva'
import { COLORS } from '../../../lib/constants'
import type { HurdleElement } from '../../../types'

interface HurdleTokenProps {
  element: HurdleElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  selected?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<HurdleElement>) => void
}

const HANDLE_RADIUS = 7
const HANDLE_DISTANCE = 25

export function HurdleToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  selected = false,
  onDragEnd,
  onSelect,
  onUpdate,
}: HurdleTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const w = fieldWidth * 0.06
  const h = fieldWidth * 0.015

  return (
    <Group>
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

      {/* Rotation handle — outside the rotated group */}
      {selected && draggable && (
        <Circle
          x={x}
          y={y - HANDLE_DISTANCE}
          radius={HANDLE_RADIUS}
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth={2}
          draggable
          onDragEnd={(e) => {
            const handleX = e.target.x()
            const handleY = e.target.y()
            const angle = Math.atan2(handleY - y, handleX - x)
            const degrees = (angle * 180) / Math.PI + 90
            onUpdate?.(element.id, { rotation: degrees })
          }}
        />
      )}
    </Group>
  )
}
