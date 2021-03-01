import * as base58 from 'micro-base58'

export const appPrefix = "apps/understory/garden"

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

export function publicNotePath(webId, workspaceSlug, name){
  return webId && name && `${profilePath(webId)}/${workspaceSlug}/${conceptNameToUrlSafeId(name)}`
}

export function privateNotePath(workspaceSlug, name){
  return name && `/notes/${workspaceSlug}/${conceptNameToUrlSafeId(name)}`
}

export function noteUriToWebId(noteUri){
  return `https://${new URL(noteUri).hostname}/profile/card#me`
}

export const conceptNameToUrlSafeId = (name) =>
  base58.encode(name)

export const urlSafeIdToConceptName = (id) => {
  return new TextDecoder().decode(base58.decode(id))
}

export function conceptUriToName(conceptUri){
  return urlSafeIdToConceptName(conceptUri.split("#").slice(-1)[0])
}

export function tagNameToUrlSafeId(tagName){
  return encodeURIComponent(tagName)
}
