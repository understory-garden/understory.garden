import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/router'
import { Slate, withReact } from 'slate-react'
import { useWebId, useEnsured, useResource, useThing } from 'swrlit'
import { createThing, setStringNoLocale, getStringNoLocale, thingAsMarkdown } from '@inrupt/solid-client'

import EditorToolbar from "../../components/EditorToolbar"
import Editable, { useNewEditor } from "../../components/Editable";
import { useNoteContainerUri } from '../../hooks/uris'
import { ExternalLinkIcon } from '../../components/icons'

const noteBody = "https://face.baby/vocab#noteBody"
const emptyBody = [{ children: [{text: ""}]}]

const thingName = "concept"

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
    } else if (resource){
      if (errorStatus == 404){
        setValue(emptyBody)
      } else {
        console.log("resource loaded, not 404, but no body")
        setValue(emptyBody)
      }
    }
  }, [bodyJSON, errorStatus])


  const onClickCallback = async function saveNote(){
    var newNote = note || createThing({name: thingName})
    newNote = setStringNoLocale(newNote, noteBody, JSON.stringify(value))
    try {
      const result = await save(newNote)
    } catch (e) {
      console.log("error saving note", e)
    }
  }

  const editor = useNewEditor()
  return (
    <div>
      <div className="flex flex-row justify-between">
        <h1 className="text-5xl">{name}</h1>
        <a href={noteDocUri} target="_blank" rel="noopener">
          <ExternalLinkIcon />
        </a>
      </div>
      <button onClick={onClickCallback}>save</button>
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
