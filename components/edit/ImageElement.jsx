import React, { useRef, useState, FunctionComponent } from 'react'
import { Transforms } from 'slate';
import { useSelected, useFocused, useEditor, ReactEditor } from 'slate-react';

import {EditIcon, ArrowRight} from '../icons';

import { ImageEditor } from '../ImageUploader';

const ImageElement = ({ attributes, children, element }) => {
  const editor = useEditor()
  const image = useRef(null)
  const [editing, setEditing] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragStartImageWidth, setDragStartImageWidth] = useState(null)
  const selected = useSelected()
  const focused = useFocused()
  const width = element.width;
  const path = ReactEditor.findPath(editor, element)
  return (
    <div {...attributes}>
      <div contentEditable={false} className="select-none flex">
        <img ref={image}
             alt={element.alt || ""}
             src={element.url}
             style={{width}}
        />
        <div className="flex flex-col flex-shrink-0">
          <EditIcon onClick={() => setEditing(true)} />
          <div className="flex-grow-1"
               draggable={true}
               onDragStart={e => {
                 Transforms.select(editor, path)
                 setDragStartImageWidth(image && image.current && image.current.clientWidth)
                 setDragStart(e.clientX)
               }}
               onDrag={e => {
                 if (dragStartImageWidth && dragStart) {
                   const newWidth = dragStartImageWidth + (e.clientX - dragStart)
                   if (width !== newWidth) {
                     Transforms.setNodes(editor, { width: newWidth }, { at: path })
                   }
                 }
            }}>
            <ArrowRight />
          </div>
        </div>
      </div>
      {children}
      {editing && (
        <ImageEditor element={element}
                     onClose={() => setEditing(false)}
                     onSave={(savedUrl: string) => {
                       const u = new URL(savedUrl)
                       u.searchParams.set("updated", Date.now().toString())
                       Transforms.setNodes(editor, { url: u.toString() }, { at: path })
                       setEditing(false)
                     }} />
      )}
    </div>
  )
}

export default ImageElement
