// === Límites del MVP ===
export const MAX_PLAYS_PER_SESSION = 10
export const MAX_STEPS_PER_PLAY = 15

// === Cancha FIH (metros) ===
export const FIELD = {
  LENGTH_M: 91.4,
  WIDTH_M: 55,
  ASPECT_RATIO: 91.4 / 55, // ~1.662
} as const

// === Colores ===
export const COLORS = {
  field: '#2d8a4e',
  fieldLines: '#ffffff',
  ownTeam: '#f5c542',
  rivalTeam: '#e74c3c',
  ball: '#ffffff',
  ballOutline: '#333333',
  cone: '#ff8c00',
  goal: '#cccccc',
  hurdle: '#ff6347',
  arrowMovement: '#ffffff',
  arrowPass: '#00bfff',
  arrowShot: '#ff4444',
  arrowDribble: '#ffd700',
  arrowOptional: '#aaaaaa',
} as const

// === Tamaños de elementos (en unidades normalizadas 0-100) ===
export const ELEMENT_SIZES = {
  playerRadius: 2.5,
  ballRadius: 1.2,
  coneSize: 2,
  fontSize: 14,
} as const
