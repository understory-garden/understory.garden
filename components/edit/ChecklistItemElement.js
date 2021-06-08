import React from 'react';

import {
  useEditor, useReadOnly, ReactEditor
} from 'slate-react';
import { Transforms } from 'slate';

export default function CheckListItemElement({ attributes, children, element }) {
  const editor = useEditor()
  const readOnly = useReadOnly()
  const { checked } = element
  return (
    <div {...attributes}>
      <input type="checkbox" className="form-checkbox h-5 w-5 mr-2"
        checked={!!checked}
        onChange={event => {
          const path = ReactEditor.findPath(editor, element)
          Transforms.setNodes(
            editor,
            { checked: event.target.checked },
            { at: path }
          )
        }} />
      <span
        className={checked ? `line-through` : ``}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </div>
  )
}
