import { createThing, setUrl, setStringNoLocale } from '@inrupt/solid-client'
import { US } from '../vocab'

export const GnomeType = {
  Gate: "gate"
}

export const GateTemplate = {
  SinglePageGate: "single-page-gate"
}

export function newSinglePageGateThing(webId, conceptPrefix, conceptUrl) {
  let thing = createThing()
  thing = setStringNoLocale(thing, US.hasGnomeType, GnomeType.Gate)
  thing = setStringNoLocale(thing, US.usesGateTemplate, GateTemplate.SinglePageGate)
  thing = setStringNoLocale(thing, US.conceptPrefix, conceptPrefix)
  thing = setUrl(thing, US.usesConcept, conceptUrl)
  return thing
}
