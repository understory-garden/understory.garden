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
  return storageContainer && `${storageContainer}${path}/${appPrefix}/`
}

export function useImageUploadUri(webId, path='public') {
  const understoryContainerUri = useUnderstoryContainerUri(webId, path)
  return understoryContainerUri && `${understoryContainerUri}images/`
}

export function useArchiveContainerUri(webId, path = 'public') {
  const storageContainer = useStorageContainer(webId)
  return storageContainer && `${storageContainer}${path}/${appPrefix}/messages/archive`
}
