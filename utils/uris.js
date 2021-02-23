import * as base58 from 'micro-base58'

export function handleToWebId(handle) {
  if (handle) {
    try {
      new URL(handle);
      // if this doesn't throw, it's a valid URL
      return handle
    } catch (_) {
      return `https://${handle}/profile/card#me`
    }
  }
}

export function webIdToHandle(webId){
  try {
    return (new URL(webId)).hostname
  } catch (e) {
    return webId
  }
}

export function profilePath(webId){
  return `/u/${webIdToHandle(webId)}`
}

export function publicNotePath(webId, name){
  return webId && name && `${profilePath(webId)}/${conceptNameToUrlSafeId(name)}`
}

export function privateNotePath(name){
  return name && `/notes/${conceptNameToUrlSafeId(name)}`
}

export function noteUriToName(noteUri){
  return decodeURIComponent(noteUri.split("/").slice(-1)[0].replace(".ttl#concept", ""))
}

export function noteUriToWebId(noteUri){
  return `https://${new URL(noteUri).hostname}/profile/card#me`
}

export const conceptNameToUrlSafeId = (name) =>
  base58.encode(name)

export const urlSafeIdToConceptName = (id) => {
  return new TextDecoder().decode(base58.decode(id))
}
