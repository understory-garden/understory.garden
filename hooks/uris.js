import { space } from "rdf-namespaces"
import { getUrlOne } from "@solid/lit-pod";

import useProfile from "~hooks/useProfile"
import useEnsured from "~hooks/useEnsured"

export function usePostsContainerUri() {
  const { profile } = useProfile()
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return useEnsured(storageContainer && `${storageContainer}public/posts/`)
}

export function useImagesContainerUri() {
  const { profile } = useProfile()
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return useEnsured(storageContainer && `${storageContainer}public/images/`)
}
