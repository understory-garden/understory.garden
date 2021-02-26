import { useItmeContainerUri, useConceptContainerUri } from './uris'
import { useWorkspace } from './app'
import { useResource, useWebId } from 'swrlit'
import { createSolidDataset, getThingAll, getDatetime, getUrl, setUrl, getThing } from '@inrupt/solid-client'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { ITME } from '../vocab'
import { conceptNameToUrlSafeId } from '../utils/uris'

export function useConceptIndex(webId, workspaceSlug='default', storage='public'){
  const { workspace } = useWorkspace(webId, workspaceSlug, storage)
  const conceptIndexUri = workspace && getUrl(workspace, ITME.conceptIndex)
  const {resource, error, ...rest} = useResource(conceptIndexUri)
  if (error && (error.statusCode === 404)) {
    const index = createSolidDataset()
    return {index, error, ...rest}
  } else {
    return {index: resource, error, ...rest}
  }
}

export function useConcept(webId, workspaceSlug, name){
  const { workspace } = useWorkspace(webId, workspaceSlug)
  const conceptPrefix = workspace && getUrl(workspace, ITME.conceptPrefix)
  const conceptUri = conceptPrefix && name && `${conceptPrefix}${conceptNameToUrlSafeId(name)}`

  const { index: privateIndex, save: savePrivateIndex } = useConceptIndex(webId, workspaceSlug, 'private')
  const { index: publicIndex, save: savePublicIndex } = useConceptIndex(webId, workspaceSlug, 'public')
  if (conceptUri) {
    if (publicIndex && getThing(publicIndex, conceptUri)){
      return {
        conceptUri,
        concept: getThing(publicIndex, conceptUri),
        index: publicIndex,
        saveIndex: savePublicIndex
      }
    } else if (privateIndex && getThing(privateIndex, conceptUri)){
      return {
        conceptUri,
        concept: getThing(privateIndex, conceptUri),
        index: privateIndex,
        saveIndex: savePrivateIndex
      }
    } else {
      return {
        conceptUri,
        index: publicIndex,
        saveIndex: savePublicIndex
      }
    }
  } else {
    return {}
  }
}



export function useConceptsFromStorage(webId, storage, workspaceSlug){
  const {index, ...rest} = useConceptIndex(webId, workspaceSlug, storage)
  const concepts = index && getThingAll(index)
  return { concepts, ...rest }
}

export function useConcepts(webId, workspaceSlug='default'){
  const {concepts: publicConcepts} = useConceptsFromStorage(webId, 'public', workspaceSlug)
  const {concepts: privateConcepts} = useConceptsFromStorage(webId, 'private', workspaceSlug)

  const concepts = (publicConcepts || privateConcepts ) && [...(publicConcepts || []), ...(privateConcepts || [])].sort(
    (a, b) => (getDatetime(b, DCTERMS.modified) - getDatetime(a, DCTERMS.modified))
  )
  return { concepts }
}
