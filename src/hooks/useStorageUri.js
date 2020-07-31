import { space } from "rdf-namespaces"
import { getUrlOne } from "@itme/solid-client";

import { useProfile } from "./"

export default function usePostContainer(webId) {
  const { profile } = useProfile(webId)
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return storageContainer
}
