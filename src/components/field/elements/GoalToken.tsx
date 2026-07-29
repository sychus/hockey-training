import { Line, Rect, Circle, Group } from 'react-konva'
import type { GoalElement, MiniGoalElement } from '../../../types'

interface GoalTokenProps {
  element: GoalElement | MiniGoalElement
  fieldWidth: number
  fieldHeight: number
  draggable?: boolean
  selected?: boolean
  onDragEnd?: (id: string, x: number, y: number) => void
  onSelect?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<GoalElement | MiniGoalElement>) => void
}

const HANDLE_RADIUS = 7
const HANDLE_DISTANCE = 30

export function GoalToken({
  element,
  fieldWidth,
  fieldHeight,
  draggable = false,
  selected = false,
  onDragEnd,
  onSelect,
  onUpdate,
}: GoalTokenProps) {
  const x = (element.x / 100) * fieldWidth
  const y = (element.y / 100) * fieldHeight
  const isMini = element.type === 'mini-goal'
  const goalW = fieldWidth * (isMini ? 0.06 : 0.10)
  const goalH = fieldWidth * (isMini ? 0.025 : 0.04)
  const halfW = goalW / 2
  const postWidth = isMini ? 2 : 3

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
      {/* Net background */}
      <Rect
        x={-halfW}
        y={-goalH}
        width={goalW}
        height={goalH}
        fill="rgba(255,255,255,0.15)"
      />
      {/* Net pattern */}
      {Array.from({ length: 3 }, (_, i) => {
        const ny = -goalH + ((i + 1) * goalH) / 4
        return (
          <Line
            key={`nh-${i}`}
            points={[-halfW, ny, halfW, ny]}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={0.5}
          />
        )
      })}
      {/* Posts: U-shape */}
      <Line
        points={[-halfW, 0, -halfW, -goalH, halfW, -goalH, halfW, 0]}
        stroke="#ffffff"
        strokeWidth={postWidth}
        lineCap="round"
        lineJoin="round"
      />
      {/* Crossbar accent */}
      <Line
        points={[-halfW, -goalH, halfW, -goalH]}
        stroke={isMini ? '#ffcc00' : '#ff4444'}
        strokeWidth={postWidth + 1}
        lineCap="round"
      />

      {/* Rotation handle — visible when selected */}
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
              // Reset handle to its local position
              e.target.position({ x: 0, y: -HANDLE_DISTANCE })
            }}
          />
        </>
      )}
    </Group>
  )
}
