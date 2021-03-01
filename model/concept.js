import { urlSafeIdToConceptName } from '../utils/uris'
import { US } from '../vocab'
import { namedNode } from "@rdfjs/dataset";

export function conceptIdFromUri(uri){
  return uri.substring(uri.lastIndexOf('#') + 1)
}

export function conceptNameFromUri(uri){
  return urlSafeIdToConceptName(conceptIdFromUri(uri))
}

export function conceptUrisThatReference(index, conceptUri){
  return Array.from(index.match(null, namedNode(US.refs), namedNode(conceptUri))).map(({subject}) => subject.value)
}

export function conceptUrisTaggedWith(index, tagUri){
  return Array.from(index.match(null, namedNode(US.tagged), namedNode(tagUri))).map(({subject}) => subject.value)
}
