import { Slate } from 'slate-react'

import Editable, { useNewEditor } from "./Editable";

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
        <Editable readOnly={readOnly} editor={editor} />
      </Slate>
    </div>
  )
}
