import * as Fathom from 'fathom-client'

const VercelEnv = process.env.VERCEL_ENV || ''

export const FathomSiteId = (VercelEnv === "production") ? 'TMUOYFGA': 'TGJRMEAN'
export const FathomSite = (VercelEnv === "production") ?  'understory.garden' : 'staging.understory.garden'
// FathomGoals
export const FG = (VercelEnv === "production") ? {
  gateEdited:  { code: 'FQJLMZAO', cents: 0},
  gateCreated: { code: '12PROO5O', cents: 0}
} : {
  gateEdited:  { code: 'ZQBERZEV', cents: 0},
  gateCreated: { code: 'XXVHLNIP', cents: 0}
}


export function load() {
  return Fathom.load(FathomSiteId, { includededDomains : [ FathomSite ] })
}

export function trackPageview() {
  return Fathom.trackPageview()
}

export function trackGoal(goal) {
  return Fathom.trackGoal(goal.code, goal.cents)
}
