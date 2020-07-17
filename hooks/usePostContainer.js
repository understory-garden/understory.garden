import { space } from "rdf-namespaces"
import { getUrlOne } from "@solid/lit-pod";

import useProfile from "~hooks/useProfile"
import useEnsured from "~hooks/useEnsured"

export default function usePostContainer() {
  const { profile } = useProfile()
  const storageContainer = profile && getUrlOne(profile, space.storage)
  const postContainer = useEnsured(storageContainer && `${storageContainer}public/posts/`)
  return postContainer
}
