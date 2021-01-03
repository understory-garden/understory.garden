import { useState } from 'react'
import { useSlate } from 'slate-react';
import { Transforms } from 'slate'
import IconButton from './IconButton';
import { FormatBold, FormatItalic, FormatUnderlined, LinkIcon } from './icons'
import ReactModal from 'react-modal';

import {
  isMarkActive, toggleMark, isBlockActive, toggleBlock, insertImage,
  isLinkActive, activeLink, insertLink, removeLink, setLinkUrl,
  isConceptActive, insertConcept, removeConcept
} from '../utils/editor'

const MarkButton = ({ format, ...props }) => {
  const editor = useSlate()
  return (
    <IconButton
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
      {...props}
    />
  )
}

const BlockButton = ({ format, icon, ...props }) => {
  const editor = useSlate()
  return (
    <IconButton
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
      {...props}
    >
      {icon}
    </IconButton>
  )
}

function LinkButton(){
  const editor = useSlate()
  const [editingLink, setEditingLink] = useState()
  const [selection, setSelection] = useState(undefined)

  const currentActiveLink = activeLink(editor, editor.selection || selection)
  const [url, setUrl] = useState("")

  const onEditLink = () => {
    setEditingLink(true)
    setSelection(editor.selection)
    const cal = activeLink(editor, editor.selection)
    if (cal){
      setUrl(cal.url)
    } else {
      setUrl("")
    }
  }

  const onUpdateLink = () => {
    Transforms.select(editor, selection)
    if (currentActiveLink){
      setLinkUrl(editor, currentActiveLink, url)
    } else {
      insertLink(editor, url)
    }
    setEditingLink(false)
  }

  const onUnlink = () => {
    Transforms.select(editor, selection)
    removeLink(editor)
    setEditingLink(false)
  }
  return (
    <>
      <IconButton title="Link"
                  active={isLinkActive(editor)}
                  onClick={onEditLink}>
        <LinkIcon/>
      </IconButton>
      <ReactModal isOpen={editingLink}>
        <div className="flex flex-col">
          <input type="url"
                 value={url}
                 onChange={e => setUrl(e.target.value)}/>
          <div className="flex justify-between">
            <button onClick={onUpdateLink}>update link</button>
            {currentActiveLink && <button onClick={onUnlink}>unlink</button>}
            <button onClick={() => setEditingLink(false)}>cancel</button>
          </div>
        </div>
      </ReactModal>
    </>
  )
}

function ConceptLink(){
  const editor = useSlate()
  const onUpdateConcept = () => {
    if (isConceptActive(editor)){
      removeConcept(editor)
    } else {
      insertConcept(editor)
    }
  }
  return (
    <IconButton
      title="Concept"
      active={isConceptActive(editor)}
      onClick={onUpdateConcept}
    >
      [[
    </IconButton>
  )
}


export default function EditorToolbar({className, ...props}){
  return (
    <div className={`flex flex-col ${className || ''}`} {...props}>
      <div>
        <MarkButton title="Bold" format="bold"><FormatBold/></MarkButton>
        <MarkButton title="Italic" format="italic"><FormatItalic/></MarkButton>
        <MarkButton title="Underline" format="underline"> <FormatUnderlined/></MarkButton>
        <LinkButton/>
        <ConceptLink/>
      </div>
    </div>
  )
}
