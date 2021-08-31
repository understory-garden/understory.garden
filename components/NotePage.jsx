import { useMemo, useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ReactEditor, Slate } from 'slate-react'
import {
  useWebId, useThing, useAuthentication, useProfile
} from 'swrlit'
import {
  createThing, setStringNoLocale, getStringNoLocale,
  addUrl, setThing, createSolidDataset, getUrlAll, setDatetime,
  removeThing, getUrl, setUrl, removeUrl, getSourceUrl, asUrl
} from '@inrupt/solid-client'
import { namedNode } from "@rdfjs/dataset";
import { DCTERMS, FOAF } from '@inrupt/vocab-common-rdf'
import { Transition } from '@headlessui/react'
import { useDebounce } from 'use-debounce';

import EditorToolbar from "./EditorToolbar"
import Editable, { useNewEditor } from "./Editable";
import Nav from './nav'

import NoteContext from '../contexts/NoteContext'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'

import { useConceptIndex, useCombinedConceptIndex, useConcept } from '../hooks/concepts'
import { useWorkspace, useCurrentWorkspace } from '../hooks/app'

import {
  publicNotePath, privateNotePath, profilePath, conceptUriToName,
  conceptNameToUrlSafeId, urlSafeIdToConceptName, tagNameToUrlSafeId
} from '../utils/uris'
import { deleteResource } from '../utils/fetch'
import { createOrUpdateConceptIndex, conceptIdFromUri, conceptUrisThatReference } from '../model/concept'
import { createNote, createOrUpdateNote, noteStorageFileAndThingName, defaultNoteStorageUri } from '../model/note'
import { US } from '../vocab'

import { getConceptNodes, getConceptNameFromNode, getTagNodes, getTagNameFromNode } from '../utils/slate'
import { useBackups } from '../hooks/backups'
import { useConceptAutocomplete } from '../hooks/editor'

import WebMonetization from '../components/WebMonetization'
import { Loader, Portal } from '../components/elements'

const emptyBody = [{ children: [{ text: "" }] }]

function LinkToConcept({ uri, ...props }) {
  const id = conceptIdFromUri(uri)
  const name = urlSafeIdToConceptName(id)
  const { path } = useContext(NoteContext)
  return (
    <Link href={`${path}/${id}`}>
      <a className="text-blue-500 underline">[[{name}]]</a>
    </Link>
  )
}

function LinksTo({ name }) {
  const webId = useWebId()
  const { slug: workspaceSlug } = useWorkspaceContext()
  const { concept } = useConcept(webId, workspaceSlug, name)
  const conceptUris = concept && getUrlAll(concept, US.refersTo)
  return (
    <ul>
      {conceptUris && conceptUris.map(uri => (
        <li key={uri}>
          <LinkToConcept uri={uri} />
        </li>
      ))}
    </ul>
  )
}

function LinksFrom({ conceptUri }) {
  const webId = useWebId()
  const { slug: workspaceSlug } = useWorkspaceContext()
  const { index } = useCombinedConceptIndex(webId, workspaceSlug)
  const linkingConcepts = index.match(null, namedNode(US.refersTo), namedNode(conceptUri))
  return (
    <ul>
      {conceptUrisThatReference(index, conceptUri).map((uri) => (
        <li key={uri}>
          <LinkToConcept uri={uri} />
        </li>
      ))}
    </ul>
  )
}

function PrivacyControl({ name, ...rest }) {
  const [saving, setSaving] = useState(false)
  const webId = useWebId()
  const { slug: workspaceSlug } = useWorkspaceContext()
  const { concept } = useConcept(webId, workspaceSlug, name)
  const { index: privateIndex, save: savePrivateIndex } = useConceptIndex(webId, workspaceSlug, 'private')
  const { index: publicIndex, save: savePublicIndex } = useConceptIndex(webId, workspaceSlug, 'public')
  const { workspace: privateStorage } = useWorkspace(webId, workspaceSlug, 'private')
  const { workspace: publicStorage } = useWorkspace(webId, workspaceSlug, 'public')

  const publicNoteResourceUrl = publicStorage && name && `${getUrl(publicStorage, US.noteStorage)}${noteStorageFileAndThingName(name)}`
  const { thing: publicNote, save: savePublic } = useThing(publicNoteResourceUrl)

  const privateNoteResourceUrl = privateStorage && name && `${getUrl(privateStorage, US.noteStorage)}${noteStorageFileAndThingName(name)}`
  const { thing: privateNote, save: savePrivate } = useThing(privateNoteResourceUrl)

  async function makePrivateCallback() {
    setSaving(true)
    await savePrivate(setStringNoLocale(privateNote || createNote(), US.noteBody, getStringNoLocale(publicNote, US.noteBody)))
    await savePrivateIndex(setThing(privateIndex || createSolidDataset(),
      setUrl(concept, US.storedAt, privateNoteResourceUrl)))
    await savePublicIndex(removeThing(publicIndex || createSolidDataset(), concept))
    await deleteResource(publicNoteResourceUrl)
    setSaving(false)
  }
  async function makePublicCallback() {
    setSaving(true)
    await savePublic(setStringNoLocale(publicNote || createNote(), US.noteBody, getStringNoLocale(privateNote, US.noteBody)))
    await savePublicIndex(setThing(publicIndex || createSolidDataset(),
      setUrl(concept, US.storedAt, publicNoteResourceUrl)))
    await savePrivateIndex(removeThing(privateIndex || createSolidDataset(), concept))
    await deleteResource(privateNoteResourceUrl)
    setSaving(false)
  }
  return (concept && !saving) ? (
    (getUrl(concept, US.storedAt) === publicNoteResourceUrl) ? (
      <button className="btn" onClick={makePrivateCallback} {...rest}>
        make private
      </button>
    ) : ((getUrl(concept, US.storedAt) === privateNoteResourceUrl) ? (
      <button className="btn" onClick={makePublicCallback} {...rest}>
        make public
      </button>
    ) : (
      <span>bad storage url: {getUrl(concept, US.storedAt)}</span>
    )
    )
  ) : (<Loader />)
}

function Backup({ label, backup, restoreValue }) {
  const editor = useNewEditor()
  const bodyJSON = getStringNoLocale(backup, US.noteBody)
  const value = JSON.parse(bodyJSON)
  return (
    <div className="relative flex flex-col">
      <h4 className="text-xl">{label}</h4>
      <button className="btn" onClick={() => restoreValue(value)}>restore</button>
      <div className="transform scale-50 max-h-36 overflow-y-scroll">
        <Slate
          editor={editor}
          value={value}>
          <Editable readOnly editor={editor} />
        </Slate>
      </div>
    </div>
  )
}

function Backups({ name, restoreValue }) {
  const { oneMinuteBackup, fiveMinuteBackup, tenMinuteBackup, thirtyMinuteBackup } = useBackups(name)
  return (
    <div className="text-center">
      <h2 className="text-2xl">Backups</h2>
      <div className="flex flex-row">
        {oneMinuteBackup && <Backup label="One Minute" backup={oneMinuteBackup} restoreValue={restoreValue} />}
        {fiveMinuteBackup && <Backup label="Five Minutes" backup={fiveMinuteBackup} restoreValue={restoreValue} />}
        {tenMinuteBackup && <Backup label="Ten Minutes" backup={tenMinuteBackup} restoreValue={restoreValue} />}
        {thirtyMinuteBackup && <Backup label="Thirty Minutes" backup={thirtyMinuteBackup} restoreValue={restoreValue} />}
      </div>
    </div>
  )
}

export default function NotePage({ encodedName, webId, path = "/notes", readOnly = false }) {
  const name = encodedName && urlSafeIdToConceptName(encodedName)
  const myWebId = useWebId()
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace()
  const { conceptUri, concept, index: conceptIndex, saveIndex: saveConceptIndex } = useConcept(webId, workspaceSlug, name)

  const noteStorageUri = concept && getUrl(concept, US.storedAt)

  const { error, thing: note, save, mutate: mutateNote } = useThing(noteStorageUri)
  const bodyJSON = note && getStringNoLocale(note, US.noteBody)
  const [showBackups, setShowBackups] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const errorStatus = error && error.statusCode

  const [value, setValue] = useState(undefined)
  const [debouncedValue] = useDebounce(value, 1500);
  const [saving, setSaving] = useState(false)
  const saved = ((value === undefined) || (bodyJSON === JSON.stringify(value)))

  const editor = useNewEditor()
  useEffect(function resetSelectionOnNameChange() {
    editor.selection = null
  }, [name])

  useEffect(function setValueFromNote() {
    if (bodyJSON) {
      const v = JSON.parse(bodyJSON)
      setValue(v)
    } else if (errorStatus == 404) {
      setValue(emptyBody)
    }
  }, [bodyJSON, errorStatus])


  const { profile: authorProfile } = useProfile(webId)
  const authorName = authorProfile && getStringNoLocale(authorProfile, FOAF.name)

  const saveCallback = async function saveNote() {
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
  useEffect(function saveAfterDebounce() {
    if (debouncedValue) {
      const isInitialNoteState = (
        (debouncedValue === emptyBody) && (bodyJSON === undefined)
      )
      if ((JSON.stringify(debouncedValue) !== bodyJSON) && !isInitialNoteState) {
        saveCallback()
      }
    }
  }, [debouncedValue])

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { fetch } = useAuthentication()
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (url !== window.location.pathname) {
        setValue(undefined)
        editor.selection = null
      }
    }
    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])
  async function deleteCallback() {
    if (confirm(`Are you sure you want to delete ${name} ?`)) {
      await Promise.all([
        fetch(noteStorageUri, { method: 'DELETE' }),
        concept && saveConceptIndex(removeThing(conceptIndex, concept))
      ])
      // mutate to invalidate the cache for the note
      mutateNote()

      router.push("/")
    }
  }

  const coverImage = note && getUrl(note, FOAF.img)
  const noteContext = useMemo(() => ({ path: `${path}/${workspaceSlug}`, note, save }), [path, workspaceSlug, note, save])

  const {
    names: matchingConceptNames, onChange: conceptAutocompleteOnChange, onKeyDown,
    target: popoverTarget, selectionIndex: popoverSelectionIndex
  } = useConceptAutocomplete(editor)
  const showPopover = popoverTarget && matchingConceptNames && (matchingConceptNames.length > 0)
  const popoverRef = useRef()
  useEffect(() => {
    if (showPopover) {
      const el = popoverRef.current
      const domRange = ReactEditor.toDOMRange(editor, popoverTarget)
      const rect = domRange.getBoundingClientRect()
      el.style.top = `${rect.top + window.pageYOffset + 24}px`
      el.style.left = `${rect.left + window.pageXOffset}px`
    }
  }, [editor, popoverTarget])

  const onChange = useCallback(function onChange(newValue) {
    setValue(newValue)
    conceptAutocompleteOnChange && conceptAutocompleteOnChange(editor)
  }, [editor, conceptAutocompleteOnChange])

  return (
    <NoteContext.Provider value={noteContext}>
      <div className="flex flex-col page">
        <WebMonetization webId={webId} />
        <Nav />
        <div className="relative overflow-y-hidden flex-none h-56">
          {coverImage && <img className="w-full" src={coverImage} />}
          <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-white via-gray-100 flex flex-col justify-between">
            <div className="flex flex-row justify-between h-44 overflow-y-hidden">
              <div className="flex flex-col">
                <h1 className="text-5xl font-bold text-gray-800">
                  {name}
                </h1>
                {authorName && (
                  <div className="text-lg text-gray-800">
                    by&nbsp;
                    <Link href={profilePath(webId) || ""}>
                      <a>
                        {authorName}
                      </a>
                    </Link>
                  </div>
                )}
              </div>
              {name && (readOnly ? (
                (myWebId === webId) && (
                  <Link href={privateNotePath(workspaceSlug, name) || ""}>
                    <a>
                      edit
                      </a>
                  </Link>
                )
              ) : (
                <Link href={publicNotePath(webId, workspaceSlug, name) || ""}>
                  <a>
                    sharable link
                    </a>
                </Link>
              ))}
              <a href={noteStorageUri} target="_blank" rel="noopener">
                source
                </a>
              {!readOnly && (
                <div className="flex flex-col">
                  <button className="btn" onClick={() => setShowPrivacy(!showPrivacy)}>
                    {showPrivacy ? 'hide' : 'show'} privacy control
                    </button>
                  <button className="btn" onClick={deleteCallback}>
                    delete
                    </button>
                  <button className="btn" onClick={() => setShowBackups(!showBackups)}>
                    {showBackups ? 'hide' : 'show'} backups
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {showBackups && <Backups name={name} restoreValue={setValue} />}
        {showPrivacy && <PrivacyControl name={name} />}
        <section className="relative w-full flex flex-grow" aria-labelledby="slide-over-heading">
          <div className="w-full flex flex-col flex-grow">


            {(value !== undefined) ? (
              <Slate
                editor={editor}
                value={value}
                onChange={onChange}
              >
                {!readOnly && (
                  <EditorToolbar saving={saving} saved={saved} save={saveCallback}
                    className="sticky top-0 z-20" />
                )}
                <div className="flex-grow flex flex-row mt-3">
                  <Editable readOnly={readOnly}
                    onKeyDown={onKeyDown}
                    editor={editor}
                    className="flex-grow text-gray-900" />
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
                                    <LinksTo name={name} />
                                  )}
                                </div>
                                <div>
                                  <h3>Linked from</h3>
                                  {conceptIndex && (
                                    <LinksFrom conceptUri={conceptUri} />
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
            ) : (
              <Loader />
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
        {showPopover && (
          <Portal>
            <div ref={popoverRef}
              className="bg-white p-1 border-2"
              style={{
                top: '-9999px',
                left: '-9999px',
                position: 'absolute',
                zIndex: 1,
              }}>
              {matchingConceptNames && matchingConceptNames.map((name, i) => (
                <div key={name} className={`${(i === popoverSelectionIndex) ? 'bg-purple-300' : 'bg-white'}`}>
                  {name}
                </div>
              ))}
            </div>
          </Portal>
        )}
      </div>
    </NoteContext.Provider>
  )
}
