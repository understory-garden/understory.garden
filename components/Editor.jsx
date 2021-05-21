import { useState } from 'react'
import { Slate } from 'slate-react'
import {
  SlatePlugins,
  createReactPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createStrikethroughPlugin,
  createCodePlugin,
  createLinkPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  ELEMENT_LINK,
  getRenderElement,
  useStoreEditor,
  createImagePlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE
} from '@udecode/slate-plugins'

import Editable, { useNewEditor } from "./Editable";
import EditorToolbar from "./EditorToolbar"
import { withConcepts } from "../utils/editor"



export default function Editor ({ body }){
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

const ELEMENT_CONCEPT = 'concept'

const createConceptPlugin = () => ({
  pluginKeys: ELEMENT_CONCEPT,
  renderElement: getRenderElement(ELEMENT_CONCEPT),
  withOverrides: withConcepts
})

export const editorPlugins = [
  // editor
  createReactPlugin(),          // withReact
  createHistoryPlugin(),        // withHistory

  // elements
  createParagraphPlugin(),      // paragraph element
  createBlockquotePlugin(),     // blockquote element
  createCodeBlockPlugin(),      // code block element
  createHeadingPlugin(),        // heading elements
  createImagePlugin(),
  createSelectOnBackspacePlugin({allow: [ELEMENT_IMAGE]}),

  // marks
  createBoldPlugin(),           // bold mark
  createItalicPlugin(),         // italic mark
  createUnderlinePlugin(),      // underline mark
  createStrikethroughPlugin(),  // strikethrough mark
  createCodePlugin(),           // code mark

  // links
  createLinkPlugin(),
  createConceptPlugin(),
]

export const editorOptions = createSlatePluginsOptions({
  [ELEMENT_LINK]: {
    type: 'link'
  }
});