import React, { useContext, useState, forwardRef, useCallback, Ref, FunctionComponent, PropsWithChildren } from 'react';
import { Transforms, Element } from 'slate';
import { useEditor } from 'slate-react';
import { useWebId } from 'swrlit'
import { Transition } from '@headlessui/react'

import { useImageUploadUri } from '../../hooks/uris'

import { Menu, MenuItem } from '../menus'
import { insertBlock, insertionPoint } from '../../utils/editor';

import ImageUploader from '../ImageUploader'

const InsertItem = forwardRef(({ element, icon, iconBg="bg-pink-600", children, format, onClose, ...props }, ref) => {
  const editor = useEditor()
  const onClick = useCallback(async (e) => {
    const insertAt = insertionPoint(editor, element)
    insertBlock(editor, format, insertAt)
    Transforms.select(editor, insertAt)
    onClose()
  }, [editor, format, element, onClose])
  return (
    <MenuItem className="col-span-1 flex shadow-sm rounded-md cursor-pointer"
              onClick={onClick}
              ref={ref} {...props}>
      <div className={`${iconBg} text-2xl flex-shrink-0 flex items-center justify-center w-16  text-white text-sm font-medium rounded-l-md`}>
        {icon}
      </div>
      <div className="px-3 py-3 text-lg flex-1 flex items-center justify-center border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
        {children}
      </div>
    </MenuItem>
  )
})

const InsertImageItem = forwardRef(({ element, onClose, ...props }, ref) => {
  const webId = useWebId()
  const imageContainerUri = useImageUploadUri(webId)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  return (
    <>
      <MenuItem className="col-span-1 flex shadow-sm rounded-md"
                onClick={() => setImagePickerOpen(true)} ref={ref} {...props} />
      {document && (
        <ImageUploader element={element}
          onClose={onClose}
          open={imagePickerOpen}
          uploadDirectory={document.imageContainerUri} />
      )}
    </>
  )
})

const InsertMenu = ({ element, onClose, className, ...props }) => {
  return (
    <Menu
      onClose={onClose}
      className={`mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-4 lg:grid-cols-5 ${className}`}
      {...props}>
      <InsertItem element={element} format="paragraph" onClose={onClose} icon="abc">
          text
      </InsertItem>
      <InsertItem element={element} format="heading-one" onClose={onClose} icon="h1">
        heading 1
      </InsertItem>
      <InsertItem element={element} format="heading-two" onClose={onClose} icon="h2">
        heading 2
      </InsertItem>
      <InsertItem element={element} format="heading-three" onClose={onClose} icon="h3">
        heading 3
      </InsertItem>
      <InsertItem element={element} format="block-quote" onClose={onClose} icon="❝❞">
        quote
      </InsertItem>
      <InsertItem element={element} format="numbered-list" onClose={onClose} icon="1.">
        numbered list
      </InsertItem>
      <InsertItem element={element} format="bulleted-list" onClose={onClose} icon="•">
        bulleted list
      </InsertItem>
      <InsertItem element={element} format="check-list-item" onClose={onClose} icon="☑︎">
        todo list
      </InsertItem>
      {/*<InsertImageItem element={element} onClose={onClose}>
        image
      </InsertImageItem>
       */}
      <InsertItem element={element} format="table" onClose={onClose} icon="⿳">
        table
      </InsertItem>
    </Menu>)
}

export default InsertMenu
