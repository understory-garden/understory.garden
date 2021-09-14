import * as base58 from "micro-base58";

export const appPrefix =
  process.env.NEXT_PUBLIC_APP_PREFIX || "apps/understory/env/dev";

export function handleToWebId(handle) {
  if (handle) {
    try {
      new URL(handle);
      // if this doesn't throw, it's a valid URL
      return handle;
    } catch (_) {
      return `https://${handle}/profile/card#me`;
    }
  }
}

export function webIdToHandle(webId) {
  try {
    return new URL(webId).hostname;
  } catch (e) {
    return webId;
  }
}

export function profilePath(webId) {
  return `/u/${webIdToHandle(webId)}`;
}

export function understoryGardenConceptPrefix(webId, workspaceSlug) {
  return (
    webId &&
    workspaceSlug &&
    `https://${window.location.hostname}${profilePath(webId)}/${workspaceSlug}/`
  );
}

export function publicNotePath(webId, workspaceSlug, name) {
  return (
    webId &&
    name &&
    `${profilePath(webId)}/${workspaceSlug}/${conceptNameToUrlSafeId(name)}`
  );
}

export function privateNotePath(workspaceSlug, name) {
  return name && `/notes/${workspaceSlug}/${conceptNameToUrlSafeId(name)}`;
}

export function noteUriToWebId(noteUri) {
  return `https://${new URL(noteUri).hostname}/profile/card#me`;
}

export const conceptNameToUrlSafeId = (name) =>
  base58.encode(name.toLowerCase());

export const urlSafeIdToConceptName = (id) =>
  new TextDecoder().decode(base58.decode(id));

export const conceptUriToId = (conceptUri) =>
  conceptUri.split("#").slice(-1)[0];

export const conceptUriToName = (conceptUri) =>
  urlSafeIdToConceptName(conceptUriToId(conceptUri));

export function tagNameToUrlSafeId(tagName) {
  return encodeURIComponent(tagName);
}
