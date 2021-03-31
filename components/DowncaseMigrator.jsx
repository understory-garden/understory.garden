import { useState } from 'react'
import {
  asUrl, getThingAll, getThing, createThing, setDatetime, getDatetime, getUrl, getUrlAll, setUrl,
  getStringNoLocale, setStringNoLocale, setThing, addUrl, removeAll, removeThing
} from '@inrupt/solid-client'
import { useWebId, useResource, useAuthentication, useThing, useMyProfile } from 'swrlit'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { US } from '../vocab'

import { useStorageContainer } from '../hooks/uris'
import { useConceptPrefix, useConcepts, useConceptIndex, useConceptInCurrentWorkspace, useCombinedConceptIndex } from '../hooks/concepts'
import { conceptNameToUrlSafeId, conceptUriToId, urlSafeIdToConceptName } from '../utils/uris'
import { Loader } from './elements'

function newNoteUriFromOld(oldNoteUri) {
  const filename = oldNoteUri.split("/").slice(-1)[0]
  const oldId = filename.split(".ttl")[0]
  const name = urlSafeIdToConceptName(oldId)
  const newId = conceptNameToUrlSafeId(name)
  return oldNoteUri.replace(oldId, newId)
}

function newConceptUriFromOld(oldConceptUri) {
  const oldId = conceptUriToId(oldConceptUri)
  const name = urlSafeIdToConceptName(oldId)
  const newId = conceptNameToUrlSafeId(name)
  return oldConceptUri.replace(oldId, newId)
}

function Concept({ conceptUri }) {
  const [migrating, setMigrating] = useState(false)
  const webId = useWebId()
  const currentId = conceptUri && conceptUriToId(conceptUri)
  const currentName = urlSafeIdToConceptName(currentId)
  const newId = conceptNameToUrlSafeId(currentName)
  const newName = urlSafeIdToConceptName(newId)
  const needsMigration = (newId !== currentId)

  const { index: publicIndex, save: savePublicIndex } = useConceptIndex(webId, 'default', 'public')
  const { index: privateIndex, save: savePrivateIndex } = useConceptIndex(webId, 'default', 'private')

  const publicConcept = publicIndex && getThing(publicIndex, conceptUri)
  const privateConcept = privateIndex && getThing(privateIndex, conceptUri)
  const oldConcept = publicConcept || privateConcept
  const index = publicConcept ? publicIndex : (privateConcept && privateIndex)
  const saveIndex = publicConcept ? savePublicIndex : (privateConcept && savePrivateIndex)

  const oldNoteUri = oldConcept && getUrl(oldConcept, US.storedAt)
  const { thing: oldNote } = useThing(oldNoteUri)

  const newNoteUri = newNoteUriFromOld(oldNoteUri)
  const { thing: newNote, save: saveNote } = useThing(newNoteUri)

  const { concept: newConcept } = useConceptInCurrentWorkspace(newName)
  const migratable = oldConcept && index && saveIndex && oldNoteUri && oldNote && newNoteUri
  async function migrateConcept() {

    setMigrating(true)
    let updatedNote = newNote || createThing({url: newNoteUri})
    updatedNote = setStringNoLocale(updatedNote, US.noteBody, getStringNoLocale(oldNote, US.noteBody))
    await saveNote(updatedNote)

    let updatedConcept = newConcept;
    updatedConcept = setUrl(updatedConcept, US.storedAt, newNoteUri)
    updatedConcept = setDatetime(updatedConcept, DCTERMS.modified, getDatetime(oldConcept, DCTERMS.modified))
    updatedConcept = getUrlAll(oldConcept, US.refersTo).reduce(
      (c, refUri) => addUrl(c, US.refersTo, newConceptUriFromOld(refUri)),
      updatedConcept
    )

    let updatedIndex = index
    updatedIndex = setThing(updatedIndex, updatedConcept)
    updatedIndex = removeThing(updatedIndex, oldConcept)
    await saveIndex(updatedIndex)

    setMigrating(false)

  }
  const [showContent, setShowContent] = useState(false)
  return (
    <div>
      {currentName}
      {migrating ? (
        <Loader/>
      ) : (
        needsMigration && (
          <>
            <button className="btn" disabled={!migratable} onClick={migrateConcept}>migrate to {newName}</button>
          </>
        )
      )}
    </div>
  )
}

export function useNeedsDowncaseMigration(){
  const webId = useWebId()
  const { concepts } = useConcepts(webId)
  let needsMigration = false
  concepts && concepts.map(concept => {
    const conceptUri = asUrl(concept)
    const currentId = conceptUri && conceptUriToId(conceptUri)
    const currentName = urlSafeIdToConceptName(currentId)
    const newId = conceptNameToUrlSafeId(currentName)
    const thisConceptNeedsMigration = (newId !== currentId)
    needsMigration = thisConceptNeedsMigration || needsMigration
  })
  return needsMigration
}

export function DowncaseMigrator() {
  const webId = useWebId()
  const { concepts } = useConcepts(webId)
  return concepts ? (
    <div>
      <h2 className="text-2xl mb-1">case insensitive concepts migration</h2>
      <p className="font-normal mb-1">
        You MUST migrate each of the concepts with buttons below.
        If you do not, content may be hidden and the garden may not work as expected.
      </p>
      <p className="font-normal mb-1">
        If you already have two notes that differ only in concept name casing and
        would like to keep them both, please contact <a href="mailto:support@understory.coop">support</a>
      </p>
      <div>
        {concepts && concepts.map(concept => (
          <Concept conceptUri={asUrl(concept)} key={asUrl(concept)} />
        ))}
      </div>
    </div>
  ) : (
      <Loader />
    )
}
