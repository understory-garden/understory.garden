import { WS } from '@inrupt/vocab-solid-common'
import { getUrl } from '@inrupt/solid-client'
import { useProfile, useEnsured, useWebId } from 'swrlit'

export function useStorageContainer(webId) {
  const { profile } = useProfile(webId)
  return profile && getUrl(profile, WS.storage)
}

export function useItmeContainerUri(webId, path = 'public') {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}${path}/itmetest3/online/`)
}

export function useImageUploadUri(webId, path='public') {
  const itmeContainerUri = useItmeContainerUri(webId, path)
  return useEnsured(itmeContainerUri && `${itmeContainerUri}images/`)
}

export function useConceptContainerUri(webId, path='public') {
  const itmeContainerUri = useItmeContainerUri(webId, path)
  return useEnsured(itmeContainerUri && `${itmeContainerUri}concepts/`)
}

export function useArchiveContainerUri() {
  const webId = useWebId()
  const itmeContainerUri = useItmeContainerUri(webId, "private")
  return useEnsured(itmeContainerUri && `${itmeContainerUri}archive/`)
}
