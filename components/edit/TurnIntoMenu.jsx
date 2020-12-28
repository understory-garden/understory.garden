import { Ref, FunctionComponent, forwardRef, useCallback } from 'react';
import { Element } from 'slate';
import { useEditor, ReactEditor } from 'slate-react';

import {Menu, MenuItem} from '../menus';

import { makeBlock } from '../../utils/editor';

const TurnIntoItem = forwardRef(({ element, format, onClose, ...props }, ref) => {
  const editor = useEditor()
  const onClick = useCallback(() => {
    makeBlock(editor, format, ReactEditor.findPath(editor, element))
    onClose()
  }, [editor, format, element, onClose])
  return (
    <MenuItem onClick={onClick} ref={ref} {...props} />
  )
})

const TurnIntoMenu = ({ element, onClose, ...props }) => {
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
      <TurnIntoItem element={element} format="paragraph" onClose={onClose}>
        text
        </TurnIntoItem>
      <TurnIntoItem element={element} format="heading-one" onClose={onClose}>
        heading 1
        </TurnIntoItem>
      <TurnIntoItem element={element} format="heading-two" onClose={onClose}>
        heading 2
        </TurnIntoItem>
      <TurnIntoItem element={element} format="heading-three" onClose={onClose}>
        heading 3
        </TurnIntoItem>
      <TurnIntoItem element={element} format="block-quote" onClose={onClose}>
        quote
        </TurnIntoItem>
      <TurnIntoItem element={element} format="numbered-list" onClose={onClose}>
        numbered list
        </TurnIntoItem>
      <TurnIntoItem element={element} format="bulleted-list" onClose={onClose}>
        bulleted list
        </TurnIntoItem>
      <TurnIntoItem element={element} format="check-list-item" onClose={onClose}>
        todo list
        </TurnIntoItem>
    </Menu>)
}

export default TurnIntoMenu
