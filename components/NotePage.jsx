import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Transforms } from 'slate'
import { Slate, withReact } from 'slate-react'
import {
  useWebId, useEnsured, useResource, useThing, useAuthentication, useProfile
} from 'swrlit'
import {
  createThing, setStringNoLocale, getStringNoLocale, thingAsMarkdown,
  addUrl, setThing, createSolidDataset, getThing, getUrlAll, setDatetime,
  removeThing, getUrl, setDecimal, setUrl, removeUrl, getSourceUrl, asUrl
} from '@inrupt/solid-client'
import { namedNode } from "@rdfjs/dataset";
import { DCTERMS, FOAF, RDF, LDP } from '@inrupt/vocab-common-rdf'
import { Transition } from '@headlessui/react'
import { useDebounce } from 'use-debounce';
import ReactModal from 'react-modal'

import EditorToolbar from "./EditorToolbar"
import Editable, { useNewEditor } from "./Editable";
import { ExternalLinkIcon, ReportIcon } from './icons'
import Nav from './nav'

import NoteContext from '../contexts/NoteContext'
import { WorkspaceProvider, useWorkspaceContext } from '../contexts/WorkspaceContext'

import { useConceptContainerUri } from '../hooks/uris'
import { useConceptIndex, useConcept } from '../hooks/concepts'
import { useWorkspace } from '../hooks/app'

import {
  publicNotePath, privateNotePath, profilePath, conceptUriToName,
  conceptNameToUrlSafeId, urlSafeIdToConceptName
} from '../utils/uris'
import { deleteResource } from '../utils/fetch'
import { conceptNameFromUri, conceptIdFromUri } from '../model/concept'
import { ITME } from '../vocab'
import { sendMessage } from '../utils/message'
import { getConceptNodes, getConceptNameFromNode } from '../utils/slate'

import WebMonetization from '../components/WebMonetization'

const emptyBody = [{ children: [{text: ""}]}]

const thingName = "concept"

function LinkToConcept({uri, ...props}){
  const id = conceptIdFromUri(uri)
  const name = urlSafeIdToConceptName(id)
  const { path } = useContext(NoteContext)
  return (
    <Link href={`${path}/${id}`}>
      <a className="text-blue-500 underline">[[{name}]]</a>
    </Link>
  )
}

function LinksTo({referencesThing}){
  const conceptUris = getUrlAll(referencesThing, ITME.refs)
  return (
    <ul>
      {conceptUris && conceptUris.map(uri => (
        <li key={uri}>
          <LinkToConcept uri={uri}/>
        </li>
      ))}
    </ul>
  )
}

function LinksFrom({conceptIndex, conceptUri}){
  const linkingConcepts = conceptIndex.match(null, null, namedNode(conceptUri))
  return (
    <ul>
      {linkingConcepts && Array.from(linkingConcepts).map(({subject}) => (
        <li key={subject.value}>
          <LinkToConcept uri={subject.value}/>
        </li>
      ))}
    </ul>
  )
}

function createNote(){
  return createThing({name: thingName})
}

function createOrUpdateNote(note, value){
  let newNote = note || createNote()
  newNote = setStringNoLocale(newNote, ITME.noteBody, JSON.stringify(value))
  return newNote
}

function createConcept(prefix, name){
  return createThing({url: `${prefix}${conceptNameToUrlSafeId(name)}`})
}

function createConceptFor(conceptPrefix, name, conceptNames){
  let concept = createConcept(conceptPrefix, name)
  for (const conceptName of conceptNames){
    concept = addUrl(concept, ITME.refs, createConcept(conceptPrefix, conceptName))
  }
  return concept
}

function createOrUpdateConceptIndex(editor, workspace, conceptIndex, concept, name){
  const conceptPrefix = getUrl(workspace, ITME.conceptPrefix)
  const storageUri = concept ? getUrl(concept, ITME.storedAt) : defaultNoteStorageUri(workspace, name)

  const conceptNames = getConceptNodes(editor).map(
    ([concept]) => getConceptNameFromNode(concept)
  )
  let newConcept = createConceptFor(conceptPrefix, name, conceptNames)
  newConcept = addUrl(newConcept, ITME.storedAt, storageUri)
  newConcept = setDatetime(newConcept, DCTERMS.modified, new Date())
  return setThing(conceptIndex || createSolidDataset(), newConcept)
}

function noteStorageFileAndThingName(name){
  return `${conceptNameToUrlSafeId(name)}.ttl#${thingName}`
}

function defaultNoteStorageUri(workspace, name){
  const containerUri = workspace && getUrl(workspace, ITME.noteStorage)
  return containerUri && `${containerUri}${noteStorageFileAndThingName(name)}`
}

function PrivacyControl({name, ...rest}){
  const webId = useWebId()
  const { workspaceSlug } = useWorkspaceContext()
  const { concept } = useConcept(webId, workspaceSlug, name)
  const { index: privateIndex, save: savePrivateIndex } = useConceptIndex(webId, workspaceSlug, 'private')
  const { index: publicIndex, save: savePublicIndex } = useConceptIndex(webId, workspaceSlug, 'public')
  const { workspace: privateStorage } = useWorkspace(webId, workspaceSlug, 'private')
  const { workspace: publicStorage } = useWorkspace(webId, workspaceSlug, 'public')

  const publicNoteResourceUrl = publicStorage && name && `${getUrl(publicStorage, ITME.noteStorage)}${noteStorageFileAndThingName(name)}`
  const { thing: publicNote, save: savePublic } = useThing(publicNoteResourceUrl)

  const privateNoteResourceUrl = privateStorage && name && `${getUrl(privateStorage, ITME.noteStorage)}${noteStorageFileAndThingName(name)}`
  const { thing: privateNote, save: savePrivate  } = useThing(privateNoteResourceUrl)

  async function makePrivateCallback(){
    await savePrivate(setStringNoLocale(privateNote || createThing({name: thingName}), ITME.noteBody, getStringNoLocale(publicNote, ITME.noteBody)))
    await savePrivateIndex(setThing(privateIndex || createSolidDataset(),
                                    setUrl(concept, ITME.storedAt, privateNoteResourceUrl)))
    await savePublicIndex(removeThing(publicIndex || createSolidDataset(), concept))
    await deleteResource(publicNoteResourceUrl)
  }
  async function makePublicCallback(){
    await savePublic(setStringNoLocale(publicNote || createThing({name: thingName1}), ITME.noteBody, getStringNoLocale(privateNote, ITME.noteBody)))
    await savePublicIndex(setThing(publicIndex || createSolidDataset(),
                                   setUrl(concept, ITME.storedAt, publicNoteResourceUrl)))
    await savePrivateIndex(removeThing(privateIndex || createSolidDataset(), concept))
    await deleteResource(privateNoteResourceUrl)
  }
  return concept ? (
    (getUrl(concept, ITME.storedAt) === publicNoteResourceUrl) ? (
      <button onClick={makePrivateCallback} {...rest}>
        make private
      </button>
    ) : (
      <button onClick={makePublicCallback} {...rest}>
        make public
      </button>
    )
  ) : (<div>loading...</div>)
}

export default function NotePage({encodedName, webId, path="/notes", readOnly=false, workspaceSlug}){
  const name = encodedName && urlSafeIdToConceptName(encodedName)
  const myWebId = useWebId()
  const { workspace } = useWorkspace(webId, workspaceSlug)
  const { conceptUri, concept, index: conceptIndex, saveIndex: saveConceptIndex} = useConcept(webId, workspaceSlug, name)
  const noteStorageUri = conceptIndex && concept ? getUrl(concept, ITME.storedAt) : defaultNoteStorageUri(workspace, name)
  const { error, resource, thing: note, save, isValidating } = useThing(noteStorageUri)

  const bodyJSON = note && getStringNoLocale(note, ITME.noteBody)
  const errorStatus = error && error.statusCode
  const [value, setValue] = useState(undefined)
  const [debouncedValue] = useDebounce(value, 1500);
  const [saving, setSaving] = useState(false)
  const saved = ((value === undefined) || (bodyJSON === JSON.stringify(value)))

  const editor = useNewEditor()
  useEffect(function resetSelectionOnNameChange(){
    editor.selection = null
  }, [name])

  useEffect(function setValueFromNote(){
    if (bodyJSON) {
      const v = JSON.parse(bodyJSON)
      setValue(v)
    } else if (errorStatus == 404){
      setValue(emptyBody)
    }
  }, [bodyJSON, errorStatus])


  const { profile: authorProfile } = useProfile(webId)
  const authorName = authorProfile && getStringNoLocale(authorProfile, FOAF.name)


  const saveCallback = async function saveNote(){
    const newNote = createOrUpdateNote(note, value)
    const newConceptIndex = createOrUpdateConceptIndex(editor, workspace, conceptIndex, concept, name)
    setSaving(true)
    try {
      await save(newNote)
      await saveConceptIndex(newConceptIndex)
    } catch (e) {
      console.log("error saving note", e)
    } finally {
      setSaving(false)
    }
  }

  useEffect(function saveAfterDebounce(){
    if (debouncedValue){
      const isInitialNoteState = (
        (debouncedValue === emptyBody) && (bodyJSON === undefined)
      )
      if ((JSON.stringify(debouncedValue) !== bodyJSON) && !isInitialNoteState){
        saveCallback()
      }
    }
  }, [debouncedValue])

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { fetch } = useAuthentication()
  const router = useRouter()
  async function deleteCallback(){
    if (confirm(`Are you sure you want to delete ${name} ?`)){
      // don't wait for this to return: we don't care
      fetch(noteStorageUri, { method: 'DELETE' })
      // do wait for this to return so it doesn't show up on the homepage
      if (concept){
        await saveConceptIndex(removeThing(conceptIndex, concept))
      }
      router.push("/")
    }
  }


  const coverImage = note && getUrl(note, FOAF.img)

  const [reporting, setReporting] = useState(false)
  return (
    <WorkspaceProvider webId={webId} slug={workspaceSlug}>
      <NoteContext.Provider value={{path: `${path}/${workspaceSlug}`, note, save}}>
        <div className="flex flex-col page">
          <WebMonetization webId={webId} />
          <Nav />
          <div className="relative overflow-y-hidden flex-none h-56">
            {coverImage && <img className="w-full" src={coverImage}/>}
            <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-white via-gray-100 flex flex-col justify-between">
              <div className="flex flex-row justify-between h-44 overflow-y-hidden">
                <div className="flex flex-col">
                  <h1 className="text-5xl font-bold text-gray-800">
                    {name}
                  </h1>
                  <div className="text-lg text-gray-800">
                    by&nbsp;
                    <Link href={profilePath(webId)}>
                      <a>
                        {authorName || "someone cool"}
                      </a>
                    </Link>
                  </div>
                </div>
                {name && (readOnly ? (
                  (myWebId === webId) && (
                    <Link href={privateNotePath(workspaceSlug, name)}>
                      <a>
                        edit
                      </a>
                    </Link>
                  )
                ) : (
                  <Link href={publicNotePath(webId, workspaceSlug, name)}>
                    <a>
                      sharable link
                    </a>
                  </Link>
                ))}
                <a href={noteStorageUri} target="_blank" rel="noopener">
                  source
                </a>
                {name && <PrivacyControl name={name} />}
                <button onClick={deleteCallback}>
                  delete
                </button>
              </div>
            </div>
          </div>
          <section className="relative w-full flex flex-grow" aria-labelledby="slide-over-heading">
            <div className="w-full flex flex-col flex-grow">
              {(value !== undefined) && (
                <Slate
                  editor={editor}
                  value={value}
                  onChange={newValue => setValue(newValue)}
                >
                  {!readOnly && (
                    <EditorToolbar saving={saving} saved={saved} save={saveCallback}
                                   className="sticky top-0 z-20"/>
                  )}
                  <div className="flex-grow flex flex-row mt-3">
                    <Editable readOnly={readOnly} editor={editor} className="flex-grow text-gray-900" />
                    <div className="relative">
                      <button onClick={() => setSidebarOpen(!sidebarOpen)}
                              className="h-2 text-3xl text-pink-500 font-bold fixed right-2">
                        {sidebarOpen ? ">>" : "<<"}
                      </button>
                      <Transition
                        show={sidebarOpen}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full">
                        {
                          (ref) => (
                            <div className="w-screen max-w-md flex-grow min-w-min" ref={ref}>
                              <div className="h-full flex flex-col pb-6 shadow-xl overflow-y-scroll">
                                <div className="px-6 sm:px-6">
                                  <div className="flex items-start justify-between">
                                    <h2 id="slide-over-heading" className="text-xl font-bold text-gray-100">
                                      Links
                                    </h2>
                                  </div>
                                </div>
                                <div className="mt-6 relative flex-1 px-4 sm:px-6 flex flex-col">
                                  <div>
                                    <h3>Links to</h3>
                                    {concept && (
                                      <LinksTo referencesThing={concept}/>
                                    )}
                                  </div>
                                  <div>
                                    <h3>Linked from</h3>
                                    {conceptIndex && (
                                      <LinksFrom conceptIndex={conceptIndex} conceptUri={conceptUri}/>
                                    )}
                                  </div>
                                </div>
                                <div className="px-6 mt-6">
                                  <h2 className="text-xl">
                                    Actions
                                  </h2>
                                </div>
                              </div>
                            </div>
                          )
                        }
                      </Transition>
                    </div>
                  </div>
                </Slate>
              )}
              {/*
                 <div>
                 <pre>
                 {JSON.stringify(editor.selection, null, 2)}
                 {JSON.stringify(value, null, 2)}
                 </pre>
                 </div>
               */}
            </div>
          </section>
        </div>
      </NoteContext.Provider>
    </WorkspaceProvider>
  )
}
