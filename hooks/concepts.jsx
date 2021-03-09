import { dataset } from "@rdfjs/dataset";
import { createSolidDataset, getThingAll, getDatetime, getUrl, setUrl, getThing, createThing } from '@inrupt/solid-client'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { useResource, useWebId } from 'swrlit'

import { useConceptContainerUri } from './uris'
import { useWorkspace } from './app'
import { US } from '../vocab'
import { conceptNameToUrlSafeId } from '../utils/uris'
import { defaultNoteStorageUri } from '../model/note'
import { useCurrentWorkspace } from './app'
import { useMemoCompare } from './react'
import equal from 'fast-deep-equal/es6'

export function useConceptIndex(webId, workspaceSlug='default', storage='public'){
  const { workspace } = useWorkspace(webId, workspaceSlug, storage)
  const conceptIndexUri = workspace && getUrl(workspace, US.conceptIndex)
  const {resource, error, ...rest} = useResource(conceptIndexUri)
  if (error && (error.statusCode === 404)) {
    const index = createSolidDataset()
    return {index, error, ...rest}
  } else {
    return {index: resource, error, ...rest}
  }
}

export function useCombinedConceptIndex(webId, workspaceSlug){
  const { index: privateIndex, save: savePrivateIndex } = useConceptIndex(webId, workspaceSlug, 'private')
  const { index: publicIndex, save: savePublicIndex } = useConceptIndex(webId, workspaceSlug, 'public')
  return {index: dataset([...privateIndex ? privateIndex.quads : [], ...publicIndex ? publicIndex.quads : []])}
}

export function useConceptPrefix(webId, workspaceSlug){
  const { workspace } = useWorkspace(webId, workspaceSlug)
  const conceptPrefix = workspace && getUrl(workspace, US.conceptPrefix)
  return conceptPrefix
}

function maybeNewConcept(url, workspace, name){
  return url && workspace && name && setUrl(createThing({url}), US.storedAt, defaultNoteStorageUri(workspace, name))
}

export function useConcept(webId, workspaceSlug, name){
  const { workspace } = useWorkspace(webId, workspaceSlug)
  const conceptPrefix = useConceptPrefix(webId, workspaceSlug)
  const conceptUri = conceptPrefix && name && `${conceptPrefix}${conceptNameToUrlSafeId(name)}`

  const { index: privateIndex, save: savePrivateIndex } = useConceptIndex(webId, workspaceSlug, 'private')
  const { index: publicIndex, save: savePublicIndex } = useConceptIndex(webId, workspaceSlug, 'public')
  const publicConcept = publicIndex && getThing(publicIndex, conceptUri)
  const privateConcept = privateIndex && getThing(privateIndex, conceptUri)
  const thisConcept = publicConcept || privateConcept || maybeNewConcept(conceptUri, workspace, name)
  const concept = useMemoCompare(thisConcept, equal)
  if (conceptUri) {
    if (publicConcept){
      return {
        conceptUri,
        concept,
        index: publicIndex,
        saveIndex: savePublicIndex
      }
    } else if (privateConcept){
      return {
        conceptUri,
        concept,
        index: privateIndex,
        saveIndex: savePrivateIndex
      }
    } else if (privateIndex && publicIndex && workspace) {
      return {
        conceptUri,
        concept,
        index: publicIndex,
        saveIndex: savePublicIndex
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

export function useConceptInCurrentWorkspace(name){
  const webId = useWebId()
  const { slug: workspaceSlug } = useCurrentWorkspace()
  return useConcept(webId, workspaceSlug, name)
}
