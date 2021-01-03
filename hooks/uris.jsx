import { WS } from '@inrupt/vocab-solid-common'
import { getUrl } from '@inrupt/solid-client'
import { useProfile, useEnsured } from 'swrlit'

export function useStorageContainer(webId) {
  const { profile } = useProfile(webId)
  return profile && getUrl(profile, WS.storage)
}

export function useFacebabyContainerUri(webId, path = 'public') {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}${path}/itme/facebaby/`)
}

export function useImageUploadUri(webId) {
  const facebabyContainerUri = useFacebabyContainerUri(webId)
  return useEnsured(facebabyContainerUri && `${facebabyContainerUri}images/`)
}

export function useConceptContainerUri(webId) {
  const facebabyContainerUri = useFacebabyContainerUri(webId)
  return useEnsured(facebabyContainerUri && `${facebabyContainerUri}concepts/`)
}
