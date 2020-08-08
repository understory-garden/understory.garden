import { space } from "rdf-namespaces"
import { getUrl } from "@itme/solid-client";

import { useProfile, useEnsured } from "./"

export function useStorageContainer(webId) {
  const { profile } = useProfile(webId)
  return profile && getUrl(profile, space.storage)

}

export function usePostsContainerUri(webId, path = 'public') {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}${path}/itme/posts/`)
}

export function useImagesContainerUri(webId, path = 'private') {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}${path}/itme/images/`)
}

export function usePodsContainerUri(webId, path = 'private') {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}${path}/podmap/pods/`)
}

export function useItmeStylesheetUri(webId) {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}public/itme/stylesheet.css`)
}
