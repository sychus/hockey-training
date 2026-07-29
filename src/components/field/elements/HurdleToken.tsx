import { Rect, Circle, Line, Group } from 'react-konva'
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

      {/* Rotation handle */}
      {selected && draggable && (
        <>
          <Line
            points={[0, 0, 0, -HANDLE_DISTANCE]}
            stroke="#3b82f6"
            strokeWidth={1.5}
            dash={[4, 3]}
            listening={false}
          />
          <Circle
            x={0}
            y={-HANDLE_DISTANCE}
            radius={HANDLE_RADIUS}
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth={2}
            draggable
            onDragEnd={(e) => {
              const stage = e.target.getStage()
              if (!stage) return
              const pointer = stage.getPointerPosition()
              if (!pointer) return
              const angle = Math.atan2(pointer.y - y, pointer.x - x)
              const degrees = (angle * 180) / Math.PI + 90
              onUpdate?.(element.id, { rotation: degrees })
              e.target.position({ x: 0, y: -HANDLE_DISTANCE })
            }}
          />
        </>
      )}
    </Group>
  )
}
