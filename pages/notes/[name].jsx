import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Transforms } from 'slate'
import { Slate, withReact } from 'slate-react'
import { useWebId, useEnsured, useResource, useThing } from 'swrlit'
import {
  createThing, setStringNoLocale, getStringNoLocale, thingAsMarkdown,
  addUrl, setThing, createSolidDataset, getThing, getUrlAll, setDatetime
} from '@inrupt/solid-client'
import { namedNode } from "@rdfjs/dataset";
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import { Transition } from '@headlessui/react'

import EditorToolbar from "../../components/EditorToolbar"
import Editable, { useNewEditor } from "../../components/Editable";
import { ExternalLinkIcon } from '../../components/icons'
import Nav from '../../components/nav'

import { useConceptContainerUri } from '../../hooks/uris'
import { useConceptIndex } from '../../hooks/concepts'

import { getConceptNodes, getConceptNameFromNode } from '../../utils/slate'
import { conceptNameFromUri } from '../../model/concept'
import { noteBody,  refs } from '../../vocab'

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
  return (
    <Link href={`/notes/${nameInUri}`}>
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

export default function NotePage(){
  const router = useRouter()
  const { query: { name } } = router

  const webId = useWebId()
  const conceptContainerUri = useConceptContainerUri(webId)
  const conceptDocUri = conceptContainerUri && `${conceptContainerUri}${encodeURIComponent(name)}.ttl`
  const conceptUri = conceptDocUri && `${conceptDocUri}#${thingName}`
  const { error, resource, thing: note, save, isValidating } = useThing(conceptUri)
  const bodyJSON = note && getStringNoLocale(note, noteBody)
  const errorStatus = error && error.status
  const [value, setValue] = useState(undefined)

  const editor = useNewEditor()
  useEffect(function resetSelectionOnNameChange(){
    editor.selection = null
  }, [name])

  useEffect(function setValueFromNote(){
    if (bodyJSON) {
      setValue(JSON.parse(bodyJSON))
    } else if (errorStatus == 404){
      setValue(emptyBody)
    }
  }, [bodyJSON, errorStatus])

  const {index: conceptIndex, save: saveConceptIndex} = useConceptIndex()
  const conceptReferences = conceptIndex && conceptUri && getThing(conceptIndex, conceptUri)

  const saveCallback = async function saveNote(){
    let newNote = note || createThing({name: thingName})
    newNote = setStringNoLocale(newNote, noteBody, JSON.stringify(value))
    const concepts = getConceptNodes(editor).map(
      ([concept]) => `${conceptContainerUri}${encodeURIComponent(getConceptNameFromNode(concept))}.ttl#${thingName}`)
    let newConceptReferences = createConceptReferencesFor(conceptUri, concepts)
    newConceptReferences = setDatetime(newConceptReferences, DCTERMS.modified, new Date())
    const newConceptIndex = setThing(conceptIndex || createSolidDataset(), newConceptReferences)
    try {
      await save(newNote)
      await saveConceptIndex(newConceptIndex)
    } catch (e) {
      console.log("error saving note", e)
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <Nav />
      <div className="flex flex-row justify-between">
        <h1 className="text-5xl">{name}</h1>
        <a href={conceptDocUri} target="_blank" rel="noopener">
          <ExternalLinkIcon />
        </a>
      </div>
      <button onClick={saveCallback}>save</button>

      <section className="relative w-screen flex flex-grow" aria-labelledby="slide-over-heading">
        <div className="w-full flex flex-col flex-grow">
          {(value !== undefined) && (
            <Slate
              editor={editor}
              value={value}
              onChange={newValue => setValue(newValue)}
            >
              <EditorToolbar/>
              <Editable readOnly={false} editor={editor} className="flex-grow" />
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
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="h-2 text-2xl text-pink-900 font-bold">
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
                <div className="h-full flex flex-col py-6 shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
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
                </div>
              </div>
            )
          }
        </Transition>
      </section>
    </div>
  )
}
