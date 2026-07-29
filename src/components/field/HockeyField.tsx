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

      {/* Shooting circle (D) — arriba */}
      <ShootingCircleD
        centerX={centerX}
        baseY={0}
        direction="down"
        fieldWidth={width}
        lineColor={lineColor}
        lineWidth={lw}
      />

      {/* Shooting circle (D) — abajo */}
      <ShootingCircleD
        centerX={centerX}
        baseY={height}
        direction="up"
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

      {/* Arco — arriba (dentro de la cancha, sobre la línea de fondo) */}
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
 * El "D" de hockey FIH: un arco de 14.63m de radio + línea recta de 3.66m en la base.
 * Se dibuja con un Shape custom usando la API Canvas 2D.
 */
function ShootingCircleD({
  centerX,
  baseY,
  direction,
  fieldWidth,
  lineColor,
  lineWidth,
}: {
  centerX: number
  baseY: number
  direction: 'up' | 'down'
  fieldWidth: number
  lineColor: string
  lineWidth: number
}) {
  const radiusPx = (FIELD_LINES.shootingCircle.radiusPct / 100) * fieldWidth
  const straightHalf = ((FIELD_LINES.shootingCircle.straightLineWidthPct / 100) * fieldWidth) / 2

  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        ctx.beginPath()

        if (direction === 'down') {
          // "D" mirando hacia abajo (parte superior de la cancha)
          // Línea recta en la base (sobre la línea de fondo)
          ctx.moveTo(centerX - straightHalf, baseY)

          // Arco hacia abajo
          const startAngle = Math.asin(straightHalf / radiusPx)
          ctx.arc(
            centerX,
            baseY,
            radiusPx,
            Math.PI + startAngle,
            -startAngle,
            false,
          )
        } else {
          // "D" mirando hacia arriba (parte inferior de la cancha)
          ctx.moveTo(centerX + straightHalf, baseY)

          const startAngle = Math.asin(straightHalf / radiusPx)
          ctx.arc(
            centerX,
            baseY,
            radiusPx,
            -startAngle,
            Math.PI + startAngle,
            true,
          )
        }

        ctx.strokeStyle = lineColor
        ctx.lineWidth = lineWidth
        ctx.stroke()
        ctx.fillStrokeShape(shape)
      }}
      stroke={lineColor}
      strokeWidth={lineWidth}
    />
  )
}
