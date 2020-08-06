import { space } from "rdf-namespaces"
import { getUrl } from "@itme/solid-client";

import { useProfile } from "./"

export default function usePostContainer(webId) {
  const { profile } = useProfile(webId)
  const storageContainer = profile && getUrl(profile, space.storage)
  return storageContainer
}
