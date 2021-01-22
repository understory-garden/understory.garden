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
  removeThing, getUrl, setDecimal, setUrl
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

import { useConceptContainerUri } from '../hooks/uris'
import { useConceptIndex } from '../hooks/concepts'
import { useIsFeedAdmin, useFeed, useLedger } from '../hooks/feed'

import { getConceptNodes, getConceptNameFromNode } from '../utils/slate'
import { publicNotePath, privateNotePath, profilePath, noteUriToName } from '../utils/uris'
import { conceptNameFromUri } from '../model/concept'
import { noteBody,  refs, hasFeedItem, Credit, amount, accountOf } from '../vocab'
import { sendMessage } from '../utils/message'

const emptyBody = [{ children: [{text: ""}]}]

const thingName = "concept"

function createConceptReferencesFor(noteUri, conceptUris){
  var conceptReferences = createThing({url: noteUri})
  for (const uri of conceptUris){
    conceptReferences = addUrl(conceptReferences, refs, uri)
  }
  return conceptReferences
}

function LinkToConcept({uri, ...props}){
  const nameInUri = conceptNameFromUri(uri)
  const name = decodeURIComponent(nameInUri)
  const { path } = useContext(NoteContext)
  return (
    <Link href={`${path}/${nameInUri}`}>
      <a className="text-blue-500 underline">[[{name}]]</a>
    </Link>
  )
}

function LinksTo({referencesThing}){
  const conceptUris = getUrlAll(referencesThing, refs)
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
  newNote = setStringNoLocale(newNote, noteBody, JSON.stringify(value))
  return newNote
}

function createOrUpdateConceptIndex(conceptIndex, editor, conceptContainerUri, conceptUri){
  const concepts = getConceptNodes(editor).map(
    ([concept]) => `${conceptContainerUri}${encodeURIComponent(getConceptNameFromNode(concept))}.ttl#${thingName}`)
  let newConceptReferences = createConceptReferencesFor(conceptUri, concepts)
  newConceptReferences = setDatetime(newConceptReferences, DCTERMS.modified, new Date())
  return setThing(conceptIndex || createSolidDataset(), newConceptReferences)
}

function ReportDialog({conceptUri, close}){
  const [message, setMessage] = useState("")
  const [reported, setReported] = useState(false)
  function report(){
    console.log("reporting", message)
    setReported(true)
  }
  function onClose(){
    close()
  }
  return (
    <div className="w-full flex flex-col">
      {reported ? (
        <>
          <p className="text-xl mt-6 text-center">
            Thank you for your report! The offending parties will be harshly dealt with.
          </p>
          <button onClick={close} className="bg-purple-100 p-6 rounded-lg mt-6">
            Close
          </button>
        </>
      ) : (
        <>
          <h3 className="text-center text-3xl">
            REPORT THIS CONTENT
          </h3>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
                    className="mt-6 w-full h-36" />
          <button onClick={report} className="bg-purple-100 m-auto p-6 rounded-lg mt-6">
            Submit Report
          </button>
        </>
      )}
    </div>
  )
}

function BuyButton({authorWebId, conceptUri, className='', ...rest}){
  const myWebId = useWebId()
  const { profile } = useProfile(authorWebId)
  const inboxUri = profile && getUrl(profile, LDP.inbox)

  const { feed, save: saveFeed } = useFeed()
  const { ledger, save: saveLedger } = useLedger()
  async function buy(){
    await saveFeed(addUrl(feed || createThing({name: "feed"}), hasFeedItem, conceptUri))
    let ledgerEntry = createThing()
    ledgerEntry = setUrl(ledgerEntry, RDF.type, Credit)
    const award = 42.0
    ledgerEntry = setDecimal(ledgerEntry, amount, award)
    ledgerEntry = setUrl(ledgerEntry, accountOf, authorWebId)
    ledgerEntry = setDatetime(ledgerEntry, DCTERMS.date, new Date())
    await saveLedger(setThing(ledger || createSolidDataset(), ledgerEntry))
    sendMessage(inboxUri, myWebId,
                "congratulations!",
                `you've been awarded ${award} facebux for note '${noteUriToName(conceptUri)}'`)
  }
  return (
    <div className={`${className} flex flex-row`}>
      <button className="btn" onClick={buy}>buy</button>
    </div>
  )
}

export default function NotePage({name, webId, path="/notes", readOnly=false}){
  const myWebId = useWebId()
  const conceptContainerUri = useConceptContainerUri(webId)
  const conceptDocUri = conceptContainerUri && `${conceptContainerUri}${encodeURIComponent(name)}.ttl`
  const conceptUri = conceptDocUri && `${conceptDocUri}#${thingName}`
  const { error, resource, thing: note, save, isValidating } = useThing(conceptUri)
  const bodyJSON = note && getStringNoLocale(note, noteBody)
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

  const {index: conceptIndex, save: saveConceptIndex} = useConceptIndex(webId)
  const conceptReferences = conceptIndex && conceptUri && getThing(conceptIndex, conceptUri)

  const saveCallback = async function saveNote(){
    const newNote = createOrUpdateNote(note, value)
    const newConceptIndex = createOrUpdateConceptIndex(conceptIndex, editor, conceptContainerUri, conceptUri)
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
      fetch(conceptUri, { method: 'DELETE' })
      // do wait for this to return so it doesn't show up on the homepage
      if (conceptReferences){
        await saveConceptIndex(removeThing(conceptIndex, conceptReferences))
      }
      router.push("/")
    }
  }
  const coverImage = note && getUrl(note, FOAF.img)

  const [reporting, setReporting] = useState(false)
  const feedAdmin = useIsFeedAdmin()
  return (
    <NoteContext.Provider value={{path, note, save}}>
      <div className="flex flex-col page">
        <Nav />
        <div className="relative overflow-y-hidden flex-none h-56">
          {coverImage && <img className="w-full" src={coverImage}/>}
          <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-white via-gray-100 flex flex-col justify-between">
            <div className="flex flex-row justify-between h-44 overflow-y-hidden">
              <div className="flex flex-col">
                <h1 className="text-5xl font-bold text-gray-900">{name}</h1>
                <div className="text-lg">
                  by&nbsp;
                  <Link href={profilePath(webId)}>
                    <a>
                      {authorName || "someone cool"}
                    </a>
                  </Link>
                </div>
              </div>
              {readOnly ? (
                (myWebId === webId) && (
                  <Link href={privateNotePath(name)}>
                    <a>
                      edit link
                    </a>
                  </Link>
                )
              ) : (
                <Link href={publicNotePath(webId, name)}>
                  <a>
                    public link
                  </a>
                </Link>
              )}
              {/*
              <a href={conceptDocUri} target="_blank" rel="noopener">
                source
              </a>
               */}
              <ReactModal isOpen={reporting} >
                <ReportDialog conceptUri={conceptUri} close={() => setReporting(false)}/>
              </ReactModal>
            </div>
            <div class="flex flex-row">
              {/*
                 <button className="btn w-20 mt-6 flex-none" onClick={() => setReporting(true)}>
                 report
                 </button>
               */}
              {feedAdmin && (
                <BuyButton conceptUri={conceptUri} authorWebId={webId} className="ml-6"/>
              )}
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
                {!readOnly && !reporting && <EditorToolbar saving={saving} saved={saved} save={saveCallback} className="mb-3 pt-2 sticky top-0 z-20"/>}
                <div className="flex-grow flex flex-row">
                  <Editable readOnly={readOnly} editor={editor} className="flex-grow" />
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
                                  {conceptReferences && (
                                    <LinksTo referencesThing={conceptReferences}/>
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
                                <button className="btn" onClick={deleteCallback}>
                                  delete
                                </button>
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
  )
}
