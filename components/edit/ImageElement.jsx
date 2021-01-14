import React, { useRef, useState, useContext } from 'react'
import { Transforms } from 'slate';
import { useSelected, useFocused, useEditor, ReactEditor } from 'slate-react';
import { setUrl } from '@inrupt/solid-client'
import { FOAF } from '@inrupt/vocab-common-rdf'

import { EditIcon, ArrowRight, CoverImageIcon } from '../icons';

import { ImageEditor } from '../ImageUploader';
import NoteContext from '../../contexts/NoteContext'

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
  const { note, save } = useContext(NoteContext)
  async function setAsCoverImage(){
    await save(setUrl(note, FOAF.img, element.url))
  }
  return (
    <div {...attributes}>
      {editing ? (
        <ImageEditor element={element}
                     onClose={() => setEditing(false)}
                     onSave={(savedUrl) => {
                       const u = new URL(savedUrl)
                       u.searchParams.set("updated", Date.now().toString())
                       Transforms.setNodes(editor, { url: u.toString() }, { at: path })
                       setEditing(false)
                     }} />
      ) : (
      <div contentEditable={false} className="select-none flex">
        <img ref={image}
             alt={element.alt || ""}
             src={element.url}
             style={{width}}
        />
        <div className="flex flex-col flex-shrink-0">
          <EditIcon className="image-icon" onClick={() => setEditing(true)} />
          <CoverImageIcon className="image-icon" onClick={() => setAsCoverImage()} />
          <div className="flex-grow-1 image-icon"
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
      )}
      {children}
    </div>
  )
}

export default ImageElement
