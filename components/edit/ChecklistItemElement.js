import React from 'react';

import {
  useEditor, useReadOnly, ReactEditor
} from 'slate-react';
import { Transforms } from 'slate';
import Checkbox from '../Checkbox';

export default function CheckListItemElement({ attributes, children, element }) {
  const editor = useEditor()
  const readOnly = useReadOnly()
  const { checked } = element
  return (
    <div {...attributes}>
      <Checkbox
        contentEditable={false}
        checked={!!checked}
        color="default"
        size="small"
        onChange={event => {
          const path = ReactEditor.findPath(editor, element)
          Transforms.setNodes(
            editor,
            { checked: event.target.checked },
            { at: path }
          )
        }}
      />
      <span
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </div>
  )
}
