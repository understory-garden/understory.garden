import React, { FunctionComponent, ReactNode, useRef, useState } from 'react'
import { Element, Transforms } from 'slate';
import { useEditor, useReadOnly, ReactEditor } from 'slate-react';
import { useDrag, useDrop } from 'react-dnd'
import { Transition } from '@headlessui/react'


import { Menu, MenuItem } from '../menus';

import { AddIcon, DragIcon } from '../icons';

import IconButton from '../IconButton';
import InsertMenu from './InsertMenu'
import TurnIntoMenu from './TurnIntoMenu'

const BlockMenu = ({ element, open, className, onClose, ...props }) => {
  const editor = useEditor()
  const [turnIntoMenuOpen, setTurnIntoMenuOpen] = useState(false)
  return (
    <Transition
      show={open}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95">
      {
        (ref) => (
          <div ref={ref} className={`${className} flex flex-col`} {...props}>
            <ul className="flex flex-row"
              onClose={() => {
                setTurnIntoMenuOpen(false)
                onClose()
              }}>
              <li className="rounded-md border-solid border-2"
                onClick={() => {
                  Transforms.removeNodes(editor, {
                    at: ReactEditor.findPath(editor, element)
                  })
                }}>
                delete
              </li>
              <li className="rounded-md border-solid border-2"
                onClick={() => setTurnIntoMenuOpen(!turnIntoMenuOpen)}>
                turn into
              </li>
            </ul>
            {turnIntoMenuOpen && (
              <TurnIntoMenu element={element}
                onMouseEnter={() => setTurnIntoMenuOpen(true)}
                open={turnIntoMenuOpen} onClose={() => {
                  setTurnIntoMenuOpen(false)
                  onClose()
                }} />
            )}
          </div>
        )}
    </Transition>
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
    drop: (item) => {
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
  return (
    <div className={`block ${isOver ? 'is-over' : ''}`} ref={drop}>
      {!readOnly && (
        <>
          {menuOpen && (
            <BlockMenu contentEditable={false}
              className="select-none"
              element={element}
              open={menuOpen}
              onClose={() => setMenuOpen(false)} />
          )}
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
      {!readOnly && insertMenuOpen && (
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
