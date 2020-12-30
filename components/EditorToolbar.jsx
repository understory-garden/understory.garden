import IconButton from './IconButton';
import { useSlate } from 'slate-react';
import { FormatBold, FormatItalic, FormatUnderlined } from './icons'

import {
  isMarkActive, toggleMark, isBlockActive, toggleBlock, insertImage,
  isLinkActive, insertLink, isConceptActive, insertConcept
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
  return (
    <div className={`flex flex-col ${className}`} {...props}>
      <div>
        <MarkButton title="Bold" format="bold"><FormatBold/></MarkButton>
        <MarkButton title="Italic" format="italic"><FormatItalic/></MarkButton>
        <MarkButton title="Underline" format="underline"> <FormatUnderlined/></MarkButton>
      </div>
    </div>
  )
}
