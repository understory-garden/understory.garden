import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/router'
import { Slate, withReact } from 'slate-react'
import { useWebId, useEnsured, useResource, useThing } from 'swrlit'
import {
  createThing, setStringNoLocale, getStringNoLocale, thingAsMarkdown,
  addUrl, setThing, createSolidDataset, getThing
} from '@inrupt/solid-client'

import EditorToolbar from "../../components/EditorToolbar"
import Editable, { useNewEditor } from "../../components/Editable";
import { useNoteContainerUri } from '../../hooks/uris'
import { useConceptIndex } from '../../hooks/concepts'
import { ExternalLinkIcon } from '../../components/icons'
import { getConceptNodes } from '../../utils/slate'

const noteBody = "https://face.baby/vocab#noteBody"
const referencesConcept = "https://face.baby/vocab#refs"

const emptyBody = [{ children: [{text: ""}]}]

const thingName = "concept"

function createConceptReferencesFor(noteUri, conceptUris){
  var conceptReferences = createThing({url: noteUri})
  for (const uri of conceptUris){
    conceptReferences = addUrl(conceptReferences, referencesConcept, uri)
  }
  return conceptReferences
}

export default function NotePage(){
  const router = useRouter()
  const { query: { name } } = router

  const webId = useWebId()
  const noteContainerUri = useNoteContainerUri(webId)
  const noteDocUri = noteContainerUri && `${noteContainerUri}${encodeURIComponent(name)}.ttl`
  const noteUri = noteDocUri && `${noteDocUri}#${thingName}`
  const { error, resource, thing: note, save, isValidating } = useThing(noteUri)
  const bodyJSON = note && getStringNoLocale(note, noteBody)
  const errorStatus = error && error.status
  const [value, setValue] = useState(undefined)
  useEffect(function setValueFromNote(){
    if (bodyJSON) {
      setValue(JSON.parse(bodyJSON))
    } else if (errorStatus == 404){
      setValue(emptyBody)
    }
  }, [bodyJSON, errorStatus])

  const {index: conceptIndex, save: saveConceptIndex} = useConceptIndex()
  const conceptReferences = conceptIndex && getThing(conceptIndex, noteUri)

  const editor = useNewEditor()

  const saveCallback = async function saveNote(){
    var newNote = note || createThing({name: thingName})
    newNote = setStringNoLocale(newNote, noteBody, JSON.stringify(value))
    const concepts = getConceptNodes(editor).map(([concept]) => `${noteContainerUri}${concept.name}.ttl#${thingName}`)
    const newConceptReferences = createConceptReferencesFor(noteUri, concepts)
    const newConceptIndex = setThing(conceptIndex || createSolidDataset(), newConceptReferences)
    try {
      await save(newNote)
      await saveConceptIndex(newConceptIndex)
    } catch (e) {
      console.log("error saving note", e)
    }
  }

  return (
    <div>
      <div className="flex flex-row justify-between">
        <h1 className="text-5xl">{name}</h1>
        <a href={noteDocUri} target="_blank" rel="noopener">
          <ExternalLinkIcon />
        </a>
      </div>
      <button onClick={saveCallback}>save</button>
      {(value !== undefined) && (
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => setValue(newValue)}
        >
          <EditorToolbar/>
          <Editable readOnly={false} editor={editor} />
        </Slate>
      )}
    </div>
  )
}
