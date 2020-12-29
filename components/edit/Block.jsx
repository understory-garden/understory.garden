import React, { FunctionComponent, ReactNode, useRef, useState } from 'react'
import { Element, Transforms } from 'slate';
import { useEditor, useReadOnly, ReactEditor } from 'slate-react';
import { useDrag, useDrop } from 'react-dnd'

import {Menu, MenuItem} from '../menus';

import {AddIcon, DragIcon} from '../icons';

import IconButton from '../IconButton';
import InsertMenu from './InsertMenu'
import TurnIntoMenu from './TurnIntoMenu'

const BlockMenu = ({ element, onClose, ...props }) => {
  const editor = useEditor()
  const turnIntoRef = useRef(null)
  const [turnIntoMenuOpen, setTurnIntoMenuOpen] = useState(false)
  return (
    <>
      <Menu
        onClose={() => {
          setTurnIntoMenuOpen(false)
          onClose()
        }}
        {...props}>
        <MenuItem onClick={() => {
          Transforms.removeNodes(editor, {
            at: ReactEditor.findPath(editor, element)
          })
        }}>
          delete
        </MenuItem>
        <MenuItem ref={turnIntoRef}
          onMouseEnter={() => setTurnIntoMenuOpen(true)}
          onMouseLeave={() => setTurnIntoMenuOpen(false)}
        >
          turn into ⩺
        </MenuItem>
      </Menu>
      {turnIntoMenuOpen && (
        <TurnIntoMenu element={element}
          onMouseEnter={() => setTurnIntoMenuOpen(true)}
          anchorEl={turnIntoRef.current}
          open={turnIntoMenuOpen} onClose={() => {
            setTurnIntoMenuOpen(false)
            onClose()
          }} />
      )}
    </>
  )
}

const Block = ({ children, element }) => {
  const editor = useEditor()
  const readOnly = useReadOnly()
  const [menuOpen, setMenuOpen] = useState(false)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: "block", element },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    })
  })
  const [{ isOver }, drop] = useDrop({
    accept: "block",
    drop: (item: any) => {
      const sourcePath = ReactEditor.findPath(editor, item.element)
      const sourceIndex = sourcePath[sourcePath.length - 1]
      const targetPath = ReactEditor.findPath(editor, element)
      const targetIndex = targetPath[targetPath.length - 1]
      if (sourceIndex !== targetIndex) {
        const insertIndex = sourceIndex > targetIndex ? targetIndex + 1 : targetIndex
        Transforms.moveNodes(editor, {
          at: sourcePath,
          to: [...targetPath.slice(0, -1), insertIndex]
        })
      }
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  })
//  console.log("BLOCK EL", element)
  return (
    <div className={`block ${isOver ? 'is-over' : ''}`} ref={drop}>
      {!readOnly && (
        <>
          <BlockMenu contentEditable={false}
                     className="select-none"
                     element={element}
                     open={menuOpen}
                     onClose={() => setMenuOpen(false)} />
          <div contentEditable={false} className="absolute left-0">
            <button className="block-sidebar-button"
                    onClick={() => setInsertMenuOpen(!insertMenuOpen)}
                    title="insert">
              <AddIcon></AddIcon>
            </button>
            <button
              className="block-sidebar-button cursor-move"
              ref={drag}
              size="small" onClick={() => setMenuOpen(!menuOpen)}
              title="">
              <DragIcon></DragIcon>
            </button>
          </div>
        </>
      )}
      <div ref={preview} className="ml-6">
        {children}
      </div>
      {!readOnly && (
        <InsertMenu element={element}
                    contentEditable={false}
                    className="select-none"
                    open={insertMenuOpen}
                    onClose={() => {
                      setInsertMenuOpen(false)
                    }} />
      )}
    </div>
  )
}

export default Block
