import { createThing, setUrl, setStringNoLocale, asUrl, getSourceUrl } from '@inrupt/solid-client'
import { US } from '../vocab'

export const GnomeType = {
  Gate: "gate"
}

export const GateTemplate = {
  SinglePageGate: "single-page-gate"
}

export function newSinglePageGateThing(webId, conceptPrefix, index, concept) {
  let thing = createThing()
  thing = setStringNoLocale(thing, US.hasGnomeType, GnomeType.Gate)
  thing = setStringNoLocale(thing, US.usesGateTemplate, GateTemplate.SinglePageGate)
  thing = setStringNoLocale(thing, US.conceptPrefix, conceptPrefix)
  thing = setUrl(thing, US.usesConcept, asUrl(concept))
  thing = setUrl(thing, US.usesConceptIndex, getSourceUrl(index))
  return thing
}

export function updateSinglePageGateThing(thing, conceptPrefix, index, concept){
  let updatedThing = setUrl(thing, US.usesConcept, asUrl(concept));
  updatedThing = setStringNoLocale(updatedThing, US.conceptPrefix, conceptPrefix)
  updatedThing = setUrl(updatedThing, US.usesConceptIndex, getSourceUrl(index));
  return updatedThing
}

export async function setupGnomeThing(thing) {
  const response = await fetch(`/api/setup-gnome`, {
    method: 'POST',
    body: JSON.stringify({
      url: asUrl(thing)
    }),
    headers:{ 'Content-Type': 'application/json'}
  })
  return response.json()
}
