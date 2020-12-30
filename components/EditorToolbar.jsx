import { useState } from 'react'
import { useSlate } from 'slate-react';
import IconButton from './IconButton';
import { FormatBold, FormatItalic, FormatUnderlined, LinkIcon } from './icons'

import {
  isMarkActive, toggleMark, isBlockActive, toggleBlock, insertImage,
  isLinkActive, activeLink, insertLink, removeLink, isConceptActive, insertConcept
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

export default function EditorToolbar({className, ...props}){
  const editor = useSlate()
  const [shadowSelection, setShadowSelection] = useState()
  const currentActiveLink = activeLink(editor, editor.selection || editor.shadowSelection)
  console.log("CAL", editor, editor.selection, shadowSelection, currentActiveLink)
  return (
    <div className={`flex flex-col ${className}`} {...props}>
      <div>
        <MarkButton title="Bold" format="bold"><FormatBold/></MarkButton>
        <MarkButton title="Italic" format="italic"><FormatItalic/></MarkButton>
        <MarkButton title="Underline" format="underline"> <FormatUnderlined/></MarkButton>
        <IconButton title="Link"
                    active={isLinkActive(editor)}
                    onClick={() => insertLink(editor, "")}>
          <LinkIcon/>
        </IconButton>
      </div>
      {currentActiveLink && (
        <div>
          <input type="url" value={currentActiveLink.url}
                 onFocus={() => {
                   console.log("setting shadow selection to", editor.selection)
                   editor.shadowSelection = editor.selection
                 }}
                 onChange={e => setLinkUrl(editor, currentActiveLink, e.target.value)}/>
          <button onClick={() => removeLink(editor)}>unlink</button>
        </div>
      )}
    </div>
  )
}
