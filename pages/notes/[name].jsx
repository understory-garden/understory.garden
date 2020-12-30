import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/router'
import { Slate, withReact } from 'slate-react'
import { useWebId, useEnsured, useResource, useThing } from 'swrlit'
import { createThing, setStringNoLocale, getStringNoLocale, thingAsMarkdown } from '@inrupt/solid-client'

import Editable, { useNewEditor } from "../../components/Editable";
import { useNoteContainerUri } from '../../hooks/uris'

const noteBody = "https://face.baby/vocab#noteBody"
const emptyBody = [{ children: [{text: ""}]}]

export default function NotePage(){
  const router = useRouter()
  const { query: { name } } = router

  const webId = useWebId()
  const noteContainerUri = useNoteContainerUri(webId)
  const noteUri = noteContainerUri && `${noteContainerUri}${encodeURIComponent(name)}.ttl#it`
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


  const onClickCallback = async function saveNote(){
    var newNote = note || createThing({name: "it"})
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
      <h1 className="text-5xl">{name}</h1>
      <button onClick={onClickCallback}>save</button>
      {(value !== undefined) && (
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => setValue(newValue)}
        >
          <Editable readOnly={false} editor={editor} />
        </Slate>
      )}
    </div>
  )
}
