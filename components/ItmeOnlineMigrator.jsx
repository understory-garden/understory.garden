
import { useState } from 'react'
import {
  asUrl, getThingAll, getThing, createThing, setDatetime, getDatetime, getUrl, getUrlAll, setUrl,
  getStringNoLocale, setStringNoLocale, setThing, addUrl, removeAll
} from '@inrupt/solid-client'
import { useWebId, useResource, useAuthentication, useThing, useMyProfile } from 'swrlit'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { FB, ITME, US } from '../vocab'

import { useStorageContainer } from '../hooks/uris'
import { useConceptInCurrentWorkspace, useConceptIndex, useConceptPrefix } from '../hooks/concepts'
import { conceptNameToUrlSafeId } from '../utils/uris'
import { Loader } from './elements'

function nameFromUri(uri){
  const filename = uri.split("/").slice(-1)[0]
  const encodedName = filename.split(".ttl")[0]
  const name = decodeURIComponent(encodedName)
  return name
}

function Concept({conceptUri}){
  const [migrated, setMigrated] = useState(false)
  const webId = useWebId()
  const conceptPrefix = useConceptPrefix(webId, 'default')
  const name = conceptUri && nameFromUri(conceptUri)
  const { index: oldIndex } = useItmeOnlineConceptIndex()
  const oldConcept = getThing(oldIndex, conceptUri)
  const { thing: oldNote } = useThing(conceptUri)
  const { conceptUri: newConceptUri, concept: newConcept } = useConceptInCurrentWorkspace(name)
  const newNoteUri = newConcept && getUrl(newConcept, US.storedAt)
  const { thing: newNote, save: saveNote } = useThing(newNoteUri)
  const { index: newIndex, save: saveNewIndex } = useConceptIndex(webId)
  async function migrateConcept(){
    let updatedConcept = newConcept || createThing({url: newConceptUri})
    updatedConcept = setDatetime(updatedConcept, DCTERMS.modified, getDatetime(oldConcept, DCTERMS.modified))
    updatedConcept = getUrlAll(oldConcept, FB.refs).reduce(
      (c, refUri) => addUrl(c, US.refersTo, `${conceptPrefix}${conceptNameToUrlSafeId(nameFromUri(refUri))}`),
      updatedConcept
    )
    console.log("saving concept", saveNewIndex, updatedConcept)
    await saveNewIndex(setThing(newIndex, updatedConcept))
    let updatedNote = newNote || createThing({url: newNoteUri})
    updatedNote = setStringNoLocale(updatedNote, US.noteBody, getStringNoLocale(oldNote, FB.noteBody))
    console.log("saving note", updatedNote)
    await saveNote(updatedNote)
    setMigrated(true)
  }
  return (
    <div>
      {name}
      {migrated ? (
        <div>migrated!</div>
      ) : (
        <button className="btn" onClick={migrateConcept}>migrate</button>
      )}
    </div>
  )
}

export function useItmeOnlineConceptIndex(){
  const webId = useWebId()
  const storageContainerUri = useStorageContainer(webId)
  const oldConceptIndexUri = storageContainerUri && `${storageContainerUri}public/itme/online/concepts.ttl`
  const { resource, ...rest } = useResource(oldConceptIndexUri)
  return { index: resource, ...rest }
}

export function ItmeOnlineMigrator(){
  const [paymentPointerMigrated, setPaymentPointerMigrated] = useState(false)
  const { index: oldConceptIndex } = useItmeOnlineConceptIndex()
  const concepts = oldConceptIndex && getThingAll(oldConceptIndex)
  const { profile, save: saveProfile } = useMyProfile()
  async function migrate(){
    console.log(concepts.map(concept => asUrl(concept) ))
    // typo in original vocab means we need to a "triple slash" version of the itme payment pointer predicate
    const paymentPointerPredicate = "https:///itme.online/vocab#paymentPointer"
    let updatedProfile = setStringNoLocale(profile, US.paymentPointer, getStringNoLocale(profile, paymentPointerPredicate))
    console.log("updated profile", updatedProfile)
    await saveProfile(updatedProfile)
    setPaymentPointerMigrated(true)
  }
  return concepts ? (
    <div>
      <div>
        {concepts && concepts.map(concept => (
          <Concept conceptUri={asUrl(concept)} key={asUrl(concept)} />
        ))}
      </div>
      {paymentPointerMigrated ? (
        <div>migrated!</div>
      ) : (
        <button className="btn" onClick={migrate}>migrate payment pointer</button>
      )}
    </div>
  ) : (
    <Loader/>
  )
}
