import * as Fathom from 'fathom-client'

export const FG = { // Fathom Goals
  gateEdited: { code: 'ZQBERZEV', cents: 0},
  gateCreated: { code: 'XXVHLNIP', cents: 0}
}

export function trackGoal(goal) {
  Fathom.trackGoal(goal.code, goal.cents)
}
