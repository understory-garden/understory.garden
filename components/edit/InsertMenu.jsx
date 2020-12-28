import React, { useContext, useState, forwardRef, useCallback, Ref, FunctionComponent, PropsWithChildren } from 'react';
import { Transforms, Element } from 'slate';
import { useEditor } from 'slate-react';
import { useWebId } from 'swrlit'
import { useImageUploadUri } from '../../hooks/uris'

import { Menu, MenuItem } from '../menus'
import { insertBlock, insertionPoint } from '../../utils/editor';

import ImageUploader from '../ImageUploader'

const InsertItem = forwardRef(({ element, format, onClose, ...props }, ref) => {
  const editor = useEditor()
  const onClick = useCallback(async () => {
    const insertAt = insertionPoint(editor, element)
    insertBlock(editor, format, insertAt)
    Transforms.select(editor, insertAt)
    onClose()
  }, [editor, format, element, onClose])
  return (
    <MenuItem onClick={onClick} ref={ref} {...props} />
  )
})

const InsertImageItem = forwardRef(({ element, onClose, ...props }, ref) => {
  const classes = useStyles()
  const webId = useWebId()
  const imageContainerUri = useImageUploadUri(webId)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  return (
    <>
      <MenuItem onClick={() => setImagePickerOpen(true)} ref={ref} {...props} />
      {document && (
        <ImageUploader element={element}
          onClose={onClose}
          open={imagePickerOpen}
          uploadDirectory={document.imageContainerUri}
          classes={{ paper: classes.imageUploadPopover }} />
      )}
    </>
  )
})

const InsertMenu = ({ element, onClose, ...props }) => {
  return (
    <Menu
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      onClose={onClose}
      {...props}>
      <InsertItem element={element} format="paragraph" onClose={onClose}>
        text
      </InsertItem>
      <InsertItem element={element} format="heading-one" onClose={onClose}>
        heading 1
      </InsertItem>
      <InsertItem element={element} format="heading-two" onClose={onClose}>
        heading 2
      </InsertItem>
      <InsertItem element={element} format="heading-three" onClose={onClose}>
        heading 3
      </InsertItem>
      <InsertItem element={element} format="block-quote" onClose={onClose}>
        quote
      </InsertItem>
      <InsertItem element={element} format="numbered-list" onClose={onClose}>
        numbered list
      </InsertItem>
      <InsertItem element={element} format="bulleted-list" onClose={onClose}>
        bulleted list
      </InsertItem>
      <InsertItem element={element} format="check-list-item" onClose={onClose}>
        todo list
      </InsertItem>
      <InsertImageItem element={element} onClose={onClose}>
        image
      </InsertImageItem>
      <InsertItem element={element} format="table" onClose={onClose}>
        table
      </InsertItem>
    </Menu>)
}

export default InsertMenu
