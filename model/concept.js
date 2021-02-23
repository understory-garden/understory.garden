import { urlSafeIdToConceptName } from '../utils/uris'

export function conceptIdFromUri(uri){
  return uri.substring(uri.lastIndexOf('#') + 1)
}

export function conceptNameFromUri(uri){
  return urlSafeIdToConceptName(conceptIdFromUri(uri))
}
