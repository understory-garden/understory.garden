import { space } from "rdf-namespaces"
import { getUrlOne } from "@itme/solid-client";

import useProfile from "~hooks/useProfile"

export default function usePostContainer() {
  const { profile } = useProfile()
  const storageContainer = profile && getUrlOne(profile, space.storage)
  return storageContainer
}
