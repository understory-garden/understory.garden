import { useItmeContainerUri, useConceptContainerUri } from './uris'
import { useWorkspace } from './app'
import { useResource, useWebId } from 'swrlit'
import { createSolidDataset, getThingAll, getDatetime, getUrl, setUrl } from '@inrupt/solid-client'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { ITME } from '../vocab'

export function useConceptIndex(webId){
  const appContainerUri = useItmeContainerUri(webId)
  const defaultNoteContainerUri = useConceptContainerUri(webId, 'private')


  const { workspace } = useWorkspace(webId)
  const conceptIndexUri = workspace && getUrl(workspace, ITME.conceptIndex)
  const {resource, error, ...rest} = useResource(conceptIndexUri)
  if (error && (error.statusCode === 404)) {
    const index = createSolidDataset()
    return {index, error, ...rest}
  } else {
    return {index: resource, error, ...rest}
  }
}

export function useConcepts(webId){
  const {index, ...rest} = useConceptIndex(webId)
  const concepts = index && getThingAll(index).sort(
    (a, b) => (getDatetime(b, DCTERMS.modified) - getDatetime(a, DCTERMS.modified))
  )
  return { concepts, ...rest }
}
