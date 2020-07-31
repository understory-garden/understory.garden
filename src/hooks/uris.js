import { space } from "rdf-namespaces"
import { getUrlOne } from "@inrupt/solid-client";

import useProfile from "~hooks/useProfile"
import useEnsured from "~hooks/useEnsured"

export function usePostsContainerUri(path = 'public') {
  const { profile } = useProfile()
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return useEnsured(storageContainer && `${storageContainer}${path}/posts/`)
}

export function useImagesContainerUri(path = 'private') {
  const { profile } = useProfile()
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return useEnsured(storageContainer && `${storageContainer}${path}/images/`)
}
