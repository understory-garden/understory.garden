import { createThing, setUrl, setStringNoLocale } from '@inrupt/solid-client'
import { US } from '../vocab'

export const GnomeType = {
  Gate: "gate"
}

export const GateTemplate = {
  SinglePageGate: "single-page-gate"
}

export function newSinglePageGateThing(webId, conceptPrefix, noteUrl) {
  const thing = createThing()
  console.log(`SPGT ${conceptPrefix}`)
  setStringNoLocale(thing, US.hasGnomeType, GnomeType.Gate)
  setStringNoLocale(thing, US.usesGateTemplate, GateTemplate.SinglePageGate)
  setStringNoLocale(thing, US.conceptPrefix, conceptPrefix)
  setUrl(thing, US.noteUrl, noteUrl)
  return thing
}
