import * as Fathom from 'fathom-client'

const VercelEnv = process.env.VERCEL_ENV || ''

// FathomGoals
export const FG = (VercelEnv === "production") ? {
  gateEdited:  { code: 'FQJLMZAO', cents: 0},
  gateCreated: { code: '12PROO5O', cents: 0}
} : {
  gateEdited:  { code: 'ZQBERZEV', cents: 0},
  gateCreated: { code: 'XXVHLNIP', cents: 0}
}

export function trackGoal(goal) {
  Fathom.trackGoal(goal.code, goal.cents)
}
