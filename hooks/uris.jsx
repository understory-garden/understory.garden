import { WS } from '@inrupt/vocab-solid-common'
import { getUrl } from '@inrupt/solid-client'
import { useProfile, useEnsured, useWebId } from 'swrlit'
import { appPrefix } from '../utils/uris'

export function useStorageContainer(webId) {
  const { profile } = useProfile(webId)
  return profile && getUrl(profile, WS.storage)
}

export function useUnderstoryContainerUri(webId, path = 'public') {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}${path}/${appPrefix}/`)
}

export function useImageUploadUri(webId, path='public') {
  const understoryContainerUri = useUnderstoryContainerUri(webId, path)
  return useEnsured(understoryContainerUri && `${understoryContainerUri}images/`)
}

export function useConceptContainerUri(webId, path='public') {
  const understoryContainerUri = useUnderstoryContainerUri(webId, path)
  return useEnsured(understoryContainerUri && `${understoryContainerUri}concepts/`)
}

export function useArchiveContainerUri() {
  const webId = useWebId()
  const understoryContainerUri = useUnderstoryContainerUri(webId, "private")
  return useEnsured(understoryContainerUri && `${understoryContainerUri}archive/`)
}
