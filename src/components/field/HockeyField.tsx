import { Rect, Line, Circle, Group } from 'react-konva'
import { COLORS } from '../../lib/constants'

/**
 * FIH field hockey pitch — vertical orientation.
 * All measurements in meters, converted to canvas pixels.
 *
 * Field: 91.4m long x 55m wide
 * Shooting circle: 14.63m radius arc from center of goal line
 * Goal: 3.66m wide
 * 23m lines: 22.9m from each goal line
 * Penalty spot: 6.4m from goal line
 */

// Real FIH measurements in meters
const FIELD_LENGTH = 91.4
const FIELD_WIDTH = 55
const CIRCLE_RADIUS = 14.63
const GOAL_WIDTH = 3.66
const GOAL_DEPTH = 1.22
const LINE_23M = 22.9
const PENALTY_SPOT = 6.4

interface HockeyFieldProps {
  width: number
  height: number
}

export function HockeyField({ width, height }: HockeyFieldProps) {
  // Convert meters to pixels
  const mToX = (m: number) => (m / FIELD_WIDTH) * width
  const mToY = (m: number) => (m / FIELD_LENGTH) * height

  const lineColor = COLORS.fieldLines
  const lw = 2
  const centerX = width / 2
  const goalHalfPx = mToX(GOAL_WIDTH / 2)
  const goalDepthPx = mToX(GOAL_DEPTH)

  return (
    <Group>
      {/* Green background */}
      <Rect x={0} y={0} width={width} height={height} fill={COLORS.field} />

      {/* Border */}
      <Rect x={0} y={0} width={width} height={height} stroke={lineColor} strokeWidth={lw} />

      {/* Center line */}
      <Line points={[0, height / 2, width, height / 2]} stroke={lineColor} strokeWidth={lw} />

      {/* 23m line — top */}
      <Line
        points={[0, mToY(LINE_23M), width, mToY(LINE_23M)]}
        stroke={lineColor}
        strokeWidth={lw}
        dash={[10, 5]}
      />

      {/* 23m line — bottom */}
      <Line
        points={[0, height - mToY(LINE_23M), width, height - mToY(LINE_23M)]}
        stroke={lineColor}
        strokeWidth={lw}
        dash={[10, 5]}
      />

      {/* Shooting circle D — top (opens downward into field) */}
      <ShootingCircleD
        centerX={centerX}
        goalLineY={0}
        direction={1}
        mToX={mToX}
        mToY={mToY}
        lineColor={lineColor}
        lineWidth={lw}
      />

      {/* Shooting circle D — bottom (opens upward into field) */}
      <ShootingCircleD
        centerX={centerX}
        goalLineY={height}
        direction={-1}
        mToX={mToX}
        mToY={mToY}
        lineColor={lineColor}
        lineWidth={lw}
      />

      {/* Penalty spot — top */}
      <Circle x={centerX} y={mToY(PENALTY_SPOT)} radius={3} fill={lineColor} />

      {/* Penalty spot — bottom */}
      <Circle x={centerX} y={height - mToY(PENALTY_SPOT)} radius={3} fill={lineColor} />

      {/* Goal cage — top (behind goal line) */}
      <Rect
        x={centerX - goalHalfPx}
        y={-goalDepthPx}
        width={goalHalfPx * 2}
        height={goalDepthPx}
        stroke={lineColor}
        strokeWidth={lw + 1}
        fill="transparent"
      />

      {/* Goal cage — bottom */}
      <Rect
        x={centerX - goalHalfPx}
        y={height}
        width={goalHalfPx * 2}
        height={goalDepthPx}
        stroke={lineColor}
        strokeWidth={lw + 1}
        fill="transparent"
      />
    </Group>
  )
}

/**
 * The FIH "D" (shooting circle):
 * A 14.63m radius arc centered on the middle of the goal line.
 * The straight portion is the goal line itself (3.66m).
 *
 * We generate the arc as a polyline with small angle steps —
 * no ctx.arc shenanigans that get the angles wrong.
 *
 * direction: +1 = opens downward (top goal), -1 = opens upward (bottom goal)
 */
function ShootingCircleD({
  centerX,
  goalLineY,
  direction,
  mToX,
  mToY,
  lineColor,
  lineWidth,
}: {
  centerX: number
  goalLineY: number
  direction: 1 | -1
  mToX: (m: number) => number
  mToY: (m: number) => number
  lineColor: string
  lineWidth: number
}) {
  const radiusXpx = mToX(CIRCLE_RADIUS)
  const radiusYpx = mToY(CIRCLE_RADIUS)
  const halfGoalPx = mToX(GOAL_WIDTH / 2)

  // The arc starts/ends where it meets the goal line.
  // At the goal line (y=0 relative to center), x = sqrt(r^2 - 0^2) = r in X.
  // But we also have a straight 3.66m section. The arc goes from the edge
  // of that straight section all the way around.
  //
  // The angle where the arc meets the goal line:
  // sin(angle) = (goalHalfWidth / radiusX) in the X axis
  const edgeAngle = Math.asin(Math.min(halfGoalPx / radiusXpx, 1))

  // Generate arc points from -edgeAngle to PI + edgeAngle
  // (from one side of the goal line, around the arc, to the other side)
  const segments = 48
  const startAngle = -edgeAngle
  const endAngle = Math.PI + edgeAngle
  const points: number[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = startAngle + t * (endAngle - startAngle)
    // In our coordinate system:
    // angle 0 = right side of goal line
    // angle PI/2 = deepest point into field
    // angle PI = left side of goal line
    const px = centerX + radiusXpx * Math.cos(angle)
    const py = goalLineY + direction * radiusYpx * Math.sin(angle)
    points.push(px, py)
  }

  return (
    <Line
      points={points}
      stroke={lineColor}
      strokeWidth={lineWidth}
      lineCap="round"
      lineJoin="round"
    />
  )
}
