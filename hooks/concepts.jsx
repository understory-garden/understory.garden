import { useFacebabyContainerUri } from './uris'
import { useResource, useWebId } from 'swrlit'
import { getThingAll, getDatetime } from '@inrupt/solid-client'
import { DCTERMS } from '@inrupt/vocab-common-rdf'

export function useConceptIndex(webId){
  const appContainerUri = useFacebabyContainerUri(webId)

  const conceptIndexUri = appContainerUri && `${appContainerUri}concepts.ttl`
  const {resource: index, ...rest} = useResource(conceptIndexUri)
  return {index, ...rest}
}

export function useConcepts(webId){
  const {index, ...rest} = useConceptIndex(webId)
  const concepts = index && getThingAll(index).sort(
    (a, b) => (getDatetime(b, DCTERMS.modified) - getDatetime(a, DCTERMS.modified))
  )
  return { concepts, ...rest }
}
