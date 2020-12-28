import React, { useEffect, useMemo, useState } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, withReact } from 'slate-react'

import { schema } from 'rdf-namespaces';
import { getStringNoLocale } from '@inrupt/solid-client';
import ReactMarkdown from 'react-markdown'
import Editable, { useNewEditor } from "./Editable";

export default function Editor ({ body }){
  //const text = getStringNoLocale(note, schema.text)
  const editor = useNewEditor()
  const [value, setValue] = useState(body)
  const readOnly = false
  return (
    <div>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <Editable readOnly={readOnly} editor={editor} />
      </Slate>
    </div>
  )
}
