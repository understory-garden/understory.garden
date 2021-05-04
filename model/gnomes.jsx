import { createThing, setUrl, setStringNoLocale, asUrl, getSourceUrl } from '@inrupt/solid-client'
import { US } from '../vocab'
import greg from 'greg'
import * as base58 from 'micro-base58'

export const GnomeType = {
  Gate: "gate"
}

export const GateTemplate = {
  SinglePageGate: "single-page-gate"
}

export const GnomeStatus = {
  Deployed: 'deployed',
  Requested: 'requested'
}

export function encodeGnomeUrl(gnomeConfigURL) {
  return base58.encode(gnomeConfigURL)
}

export function randomReadableId() {
  // https://blog.asana.com/2011/09/6-sad-squid-snuggle-softly/
  // should reimplement with our own list of adjectives, nouns, verbs, and adverbs at some point, rather than relying on this greg lib
  return greg.sentence().replace(/\s+/g, '-').toLowerCase()
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

export async function setupGnome(body) {
  const response = await fetch(`/api/setup-gnome`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers:{ 'Content-Type': 'application/json'}
  })
  return response.json()
}
