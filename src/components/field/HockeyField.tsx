import { Rect, Line, Circle, Group, Shape } from 'react-konva'
import { FIELD_LINES } from './field-dimensions'
import { COLORS } from '../../lib/constants'

interface HockeyFieldProps {
  width: number
  height: number
}

export function HockeyField({ width, height }: HockeyFieldProps) {
  const px = (pct: number, axis: 'x' | 'y') =>
    axis === 'x' ? (pct / 100) * width : (pct / 100) * height

  const lineColor = COLORS.fieldLines
  const lw = 2

  const centerX = width / 2
  const goalHalfW = px(FIELD_LINES.goal.widthPct, 'x') / 2
  const goalDepth = px(FIELD_LINES.goal.depthPct, 'x')

  return (
    <Group>
      {/* Fondo verde */}
      <Rect x={0} y={0} width={width} height={height} fill={COLORS.field} />

      {/* Borde */}
      <Rect x={0} y={0} width={width} height={height} stroke={lineColor} strokeWidth={lw} />

      {/* Línea central */}
      <Line points={[0, height / 2, width, height / 2]} stroke={lineColor} strokeWidth={lw} />

      {/* Línea 23m — arriba */}
      <Line
        points={[0, px(FIELD_LINES.line23m.fromGoalLine, 'y'), width, px(FIELD_LINES.line23m.fromGoalLine, 'y')]}
        stroke={lineColor}
        strokeWidth={lw}
        dash={[10, 5]}
      />

      {/* Línea 23m — abajo */}
      <Line
        points={[
          0,
          height - px(FIELD_LINES.line23m.fromGoalLine, 'y'),
          width,
          height - px(FIELD_LINES.line23m.fromGoalLine, 'y'),
        ]}
        stroke={lineColor}
        strokeWidth={lw}
        dash={[10, 5]}
      />

      {/* Shooting circle (D) — arriba: opens downward into the field */}
      <ShootingCircleD
        centerX={centerX}
        goalLineY={0}
        opensDown
        fieldWidth={width}
        lineColor={lineColor}
        lineWidth={lw}
      />

      {/* Shooting circle (D) — abajo: opens upward into the field */}
      <ShootingCircleD
        centerX={centerX}
        goalLineY={height}
        opensDown={false}
        fieldWidth={width}
        lineColor={lineColor}
        lineWidth={lw}
      />

      {/* Punto de penal — arriba */}
      <Circle
        x={centerX}
        y={px(FIELD_LINES.penaltySpot.fromGoalLine, 'y')}
        radius={3}
        fill={lineColor}
      />

      {/* Punto de penal — abajo */}
      <Circle
        x={centerX}
        y={height - px(FIELD_LINES.penaltySpot.fromGoalLine, 'y')}
        radius={3}
        fill={lineColor}
      />

      {/* Arco — arriba */}
      <Rect
        x={centerX - goalHalfW}
        y={-goalDepth}
        width={goalHalfW * 2}
        height={goalDepth}
        stroke={lineColor}
        strokeWidth={lw + 1}
        fill="transparent"
      />

      {/* Arco — abajo */}
      <Rect
        x={centerX - goalHalfW}
        y={height}
        width={goalHalfW * 2}
        height={goalDepth}
        stroke={lineColor}
        strokeWidth={lw + 1}
        fill="transparent"
      />
    </Group>
  )
}

/**
 * FIH shooting circle ("D"):
 * - 14.63m radius arc centered on the middle of the goal line
 * - Plus a 3.66m straight line along the goal line (the goal width)
 * - The arc opens INTO the field (down for top goal, up for bottom goal)
 */
function ShootingCircleD({
  centerX,
  goalLineY,
  opensDown,
  fieldWidth,
  lineColor,
  lineWidth,
}: {
  centerX: number
  goalLineY: number
  opensDown: boolean
  fieldWidth: number
  lineColor: string
  lineWidth: number
}) {
  const radiusPx = (FIELD_LINES.shootingCircle.radiusPct / 100) * fieldWidth
  const straightHalf = ((FIELD_LINES.shootingCircle.straightLineWidthPct / 100) * fieldWidth) / 2

  // The angle where the arc meets the goal line
  // sin(angle) = straightHalf / radius  →  the arc starts/ends where it hits the straight section
  const edgeAngle = Math.asin(straightHalf / radiusPx)

  return (
    <Shape
      sceneFunc={(ctx) => {
        ctx.beginPath()

        if (opensDown) {
          // Top of field: arc bulges downward
          // Start at left edge of straight section on the goal line
          ctx.moveTo(centerX - straightHalf, goalLineY)

          // Arc from left to right, going DOWN (clockwise from left)
          // In canvas: 0 = right, π/2 = down, π = left, 3π/2 = up
          // We want the arc to go from (π - edgeAngle) to (edgeAngle), sweeping clockwise (downward)
          ctx.arc(
            centerX,
            goalLineY,
            radiusPx,
            Math.PI - edgeAngle,  // start: upper-left
            edgeAngle,            // end: upper-right
            false,                // clockwise = the arc goes DOWN
          )
        } else {
          // Bottom of field: arc bulges upward
          // Start at right edge of straight section on the goal line
          ctx.moveTo(centerX + straightHalf, goalLineY)

          // Arc from right to left, going UP (clockwise from right)
          ctx.arc(
            centerX,
            goalLineY,
            radiusPx,
            -edgeAngle,              // start: lower-right
            Math.PI + edgeAngle,     // end: lower-left
            false,                   // clockwise = the arc goes UP
          )
        }

        ctx.strokeStyle = lineColor
        ctx.lineWidth = lineWidth
        ctx.stroke()
      }}
    />
  )
}
