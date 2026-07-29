/**
 * Dimensiones reglamentarias FIH para hockey sobre césped.
 * Todas las medidas en metros, luego se normalizan al canvas.
 *
 * La cancha se renderiza en orientación VERTICAL (largo = eje Y).
 * Coordenadas normalizadas: x = 0-100 (ancho), y = 0-100 (largo).
 *
 * Referencia: FIH Rules of Hockey, Appendix A — Field Dimensions.
 */

const LENGTH = 91.4
const WIDTH = 55

const xPct = (meters: number) => (meters / WIDTH) * 100
const yPct = (meters: number) => (meters / LENGTH) * 100

export const FIELD_LINES = {
  centerLine: { y: 50 },

  // Líneas de 23m (22.9m desde cada línea de fondo)
  line23m: {
    fromGoalLine: yPct(22.9),
  },

  // Shooting circle (D): arco de 14.63m de radio
  shootingCircle: {
    radiusPct: xPct(14.63),
    straightLineWidthPct: xPct(3.66),
  },

  // Punto de penal: 6.4m desde línea de fondo
  penaltySpot: {
    fromGoalLine: yPct(6.4),
  },

  // Arco: 3.66m de ancho
  goal: {
    widthPct: xPct(3.66),
    depthPct: xPct(1.22),
  },
} as const
