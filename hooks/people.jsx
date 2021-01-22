import { useMyProfile } from 'swrlit'
import { getUrlAll } from '@inrupt/solid-client'
import { sioc as SIOC } from 'rdf-namespaces'

export function useFollows(){
  const { profile } = useMyProfile()
  return profile && getUrlAll(profile, SIOC.follows)
}
