import useEnsured from './useEnsured'
import useStorageUri from './useStorageUri'
import useThing, { useContainer, useResource, useFile } from './useThing'
import useWebId from './useWebId'

export function useProfile(webId) {
  const { thing: profile, ...rest } = useThing(webId)
  return { profile, ...rest }
}

export function useMyProfile() {
  const myWebId = useWebId()
  return useProfile(myWebId)
}

export { useEnsured, useStorageUri, useThing, useContainer, useResource, useFile, useWebId }
