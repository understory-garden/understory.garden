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
  return `${profilePath(webId)}/${encodeURIComponent(name)}`
}

export function privateNotePath(name){
  return `/notes/${encodeURIComponent(name)}`
}

export function noteUriToName(noteUri){
  return decodeURIComponent(noteUri.split("/").slice(-1)[0].split(".")[0])
}

export function noteUriToWebId(noteUri){
  return `https://${new URL(noteUri).hostname}/profile/card#me`
}
