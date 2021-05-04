import { createThing, setUrl, setStringNoLocale, asUrl } from '@inrupt/solid-client'
import { US } from '../vocab'

export const GnomeType = {
  Gate: "gate"
}

export const GateTemplate = {
  SinglePageGate: "single-page-gate"
}

export function newSinglePageGateThing(webId, conceptPrefix, concept) {
  let thing = createThing()
  thing = setStringNoLocale(thing, US.hasGnomeType, GnomeType.Gate)
  thing = setStringNoLocale(thing, US.usesGateTemplate, GateTemplate.SinglePageGate)
  thing = setStringNoLocale(thing, US.conceptPrefix, conceptPrefix)
  thing = setUrl(thing, US.usesConcept, asUrl(concept))
  return thing
}

export function updateSinglePageGateThing(thing, concept){
  return setUrl(thing, US.usesConcept, asUrl(concept))
}

export async function setupGnome(body) {
  const response = await fetch(`/api/setup-gnome`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers:{ 'Content-Type': 'application/json'}
  })
  return response.json()
}
