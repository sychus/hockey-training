import type { Session, Play } from '../types'
import { MAX_PLAYS_PER_SESSION, MAX_STEPS_PER_PLAY } from '../lib/constants'

export function canAddPlay(session: Session): boolean {
  return session.plays.length < MAX_PLAYS_PER_SESSION
}

export function canAddStep(play: Play): boolean {
  return play.steps.length < MAX_STEPS_PER_PLAY
}

export function getRemainingPlays(session: Session): number {
  return MAX_PLAYS_PER_SESSION - session.plays.length
}

export function getRemainingSteps(play: Play): number {
  return MAX_STEPS_PER_PLAY - play.steps.length
}
