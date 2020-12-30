import React, { useState, useRef, FunctionComponent } from 'react'
import { Transforms, Range, Element } from 'slate';
import { useSelected, useEditor } from 'slate-react';

import copy from 'copy-to-clipboard';

import IconButton from '../IconButton';
import { setLinkUrl, removeLink } from '../../utils/editor';


/*const LinkPopover: FunctionComponent<LinkPopoverProps> = ({ element, editing, setEditing, onClose, ...props }) => {
  const editor = useEditor()
  const [selection, setSelection] = useState<Range | null>(null)
  const [editValue, setEditValue] = useState(element.url)
  const classes = useStyles()
  const editLink = () => {
    setSelection(editor.selection)
    setEditing(true)
  }
  const saveLink = () => {
    setLinkUrl(editor, element, editValue)
    onClose()
    setEditing(false)
    selection && Transforms.select(editor, selection)
  }
  return (
    <Popover disableAutoFocus disableEnforceFocus
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{ className: classes.aPopover }}
      onClose={onClose}
      {...props}>
      {editing ? (
        <TextField autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
          onKeyDown={event => {
            if (event.keyCode === 13) {
              event.preventDefault()
              saveLink()
            }
          }} />
      ) : (
          <Link href={element.url} target="_blank">{element.url}</Link>
        )}
      {editing ? (
        <IconButton size="small" className={classes.linkPopupButton} title="edit link"
          onClick={saveLink}>
          <SaveIcon></SaveIcon>
        </IconButton>
      ) : (
          <IconButton size="small" className={classes.linkPopupButton} title="edit link"
            onClick={editLink}>
            <EditIcon></EditIcon>
          </IconButton>
        )}
      <IconButton size="small" className={classes.linkPopupButton} title="unlink"
        onClick={() => removeLink(editor)}>
        <UnlinkIcon></UnlinkIcon>
      </IconButton>
      <IconButton size="small" className={classes.linkPopupButton} title="copy link"
        onClick={() => copy(element.url)}>
        <CopyIcon></CopyIcon>
      </IconButton>
    </Popover>
  )
}
*/
const LinkElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  return (
    <>
      <a {...attributes} className={`${selected && "bg-red-500"}`} href={element.url} onBlur={() => console.log("A ON BLUR")}>
        {children}
      </a>
    </>
  )
}

export default LinkElement
