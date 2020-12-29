import { Ref, FunctionComponent, forwardRef, useCallback } from 'react';
import { Element } from 'slate';
import { useEditor, ReactEditor } from 'slate-react';

import {Menu, MenuItem} from '../menus';

import { makeBlock } from '../../utils/editor';

const TurnIntoItem = forwardRef(({ element, icon, iconBg="bg-blue-600", children, format, onClose, ...props }, ref) => {
  const editor = useEditor()
  const onClick = useCallback(() => {
    makeBlock(editor, format, ReactEditor.findPath(editor, element))
    onClose()
  }, [editor, format, element, onClose])
  return (
    <MenuItem className="col-span-1 flex shadow-sm rounded-md cursor-pointer"
              onClick={onClick} ref={ref} {...props} >
      <div className={`${iconBg} text-2xl flex-shrink-0 flex items-center justify-center w-16  text-white text-sm font-medium rounded-l-md`}>
        {icon}
      </div>
      <div className="px-3 py-3 text-lg flex-1 flex items-center justify-center border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
        {children}
      </div>
    </MenuItem>
  )
})

const TurnIntoMenu = ({ element, onClose, className, ...props }) => {
  return (
    <Menu className={`mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-4 lg:grid-cols-5 ${className}`}
          onClose={onClose} {...props}>
      <TurnIntoItem element={element} format="paragraph" onClose={onClose} icon="abc">
        text
        </TurnIntoItem>
      <TurnIntoItem element={element} format="heading-one" onClose={onClose} icon="h1">
        heading 1
        </TurnIntoItem>
      <TurnIntoItem element={element} format="heading-two" onClose={onClose} icon="h2">
        heading 2
        </TurnIntoItem>
      <TurnIntoItem element={element} format="heading-three" onClose={onClose} icon="h3">
        heading 3
        </TurnIntoItem>
      <TurnIntoItem element={element} format="block-quote" onClose={onClose} icon="❝❞">
        quote
        </TurnIntoItem>
      <TurnIntoItem element={element} format="numbered-list" onClose={onClose} icon="1.">
        numbered list
        </TurnIntoItem>
      <TurnIntoItem element={element} format="bulleted-list" onClose={onClose} icon="•">
        bulleted list
        </TurnIntoItem>
      <TurnIntoItem element={element} format="check-list-item" onClose={onClose} icon="☑︎">
        todo list
        </TurnIntoItem>
    </Menu>)
}

export default TurnIntoMenu
