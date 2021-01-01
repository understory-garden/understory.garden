import { useState } from 'react'
import { Slate } from 'slate-react'
import { namedNode } from "@rdfjs/dataset";


import Editable, { useNewEditor } from "./Editable";
import EditorToolbar from "./EditorToolbar"

import {
  mockSolidDatasetFrom, solidDatasetAsMarkdown, thingAsMarkdown, createThing, setThing,
  addUrl
} from '@inrupt/solid-client'

export default function Editor ({ body }){
  const editor = useNewEditor()
  const [value, setValue] = useState(body)
  const readOnly = false

  var dataset = mockSolidDatasetFrom("https://travis.coop.itme.host/public/facebaby/bidi.ttl")
  var thing = createThing({url: "https://travis.coop.itme.host/public/facebaby/notes/Lexi.ttl#it"})
  thing = addUrl(thing,
                 "https://example.com/linksTo",
                 "https://travis.coop.itme.host/public/facebaby/notes/Clams.ttl#it")
  thing = addUrl(thing,
                 "https://example.com/linksTo",
                 "https://travis.coop.itme.host/public/facebaby/notes/Fish.ttl#it")
  dataset = setThing(dataset, thing)
  var thing2 = createThing({url: "https://travis.coop.itme.host/public/facebaby/notes/Arlo.ttl#it"})
  thing2 = addUrl(thing2,
                  "https://example.com/linksTo",
                  "https://travis.coop.itme.host/public/facebaby/notes/Bacon.ttl#it")
  thing2 = addUrl(thing2,
                  "https://example.com/linksTo",
                  "https://travis.coop.itme.host/public/facebaby/notes/Fish.ttl#it")
  dataset = setThing(dataset, thing2)
  console.log(
    dataset.match(null, null, null, null)
  )
  console.log(
    dataset.match(null, null, namedNode("https://travis.coop.itme.host/public/facebaby/notes/Fish.ttl#it"), null)
  )
  //debugger
  console.log("updated")
  //console.log(solidDatasetAsMarkdown(updatedDataset))

  return (
    <div>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <EditorToolbar/>
        <Editable readOnly={readOnly} editor={editor} />
      </Slate>
      <code>
        <pre className="text-xs border-t-2 border-gray-400 bg-gray-200">
          {JSON.stringify(value, null, 2)}
        </pre>
      </code>
    </div>
  )
}
