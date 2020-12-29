import React, { useCallback, useMemo } from 'react';
import { createEditor, Text, Editor } from 'slate';
import { Editable as SlateEditable, withReact } from 'slate-react';
import isHotkey from 'is-hotkey';

import { withHistory } from 'slate-history';

import {
  withImages, withLinks, withChecklists, withLists, toggleMark,
  withTables, withConcepts
} from '../utils/editor';

import ChecklistItemElement from './edit/ChecklistItemElement'
import LinkElement from './edit/LinkElement'
//import ConceptElement from './edit/ConceptElement'
import ImageElement from './edit/ImageElement'
import Block from './edit/Block'
import Table from "./edit/Table"

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const Element = (props) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'block-quote':
      return <Block element={element}><blockquote {...attributes}>{children}</blockquote></Block>
    case 'heading-one':
      return <Block element={element}><h1 className="text-3xl" {...attributes}>{children}</h1></Block>
    case 'heading-two':
      return <Block element={element}><h2 className="text-2xl" {...attributes}>{children}</h2></Block>
    case 'heading-three':
      return <Block element={element}><h3 className="text-xl" {...attributes}>{children}</h3></Block>
    case 'bulleted-list':
      return <Block element={element}><ul className="list-disc list-inside" {...attributes}>{children}</ul></Block>
    case 'numbered-list':
      return <Block element={element}><ol className="list-decimal list-inside" {...attributes}>{children}</ol></Block>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'image':
      return <Block element={element}><ImageElement {...props} /></Block>
    case 'link':
      return <LinkElement {...props} />
//    case 'concept':
//      return <ConceptElement {...props} />
    case 'check-list-item':
      return <Block element={element}><ChecklistItemElement {...props} /></Block>
    case 'table':
      return (
        <Block element={element}>
          <Table {...props} />
        </Block>
      )
    case 'table-row':
      return <tr {...attributes}>{children}</tr>
    case 'table-cell':
      return <td {...attributes}>{children}</td>
    default:
      return <Block element={element}><p {...attributes}>{children}</p></Block>
  }
}

export const useNewEditor = () => useMemo(() => withConcepts(
//  withTables(
    withLists(
      withChecklists(
        withLinks(
//          withImages(
            withReact(
              withHistory(
                createEditor()
              )
            )
//          )
        )
      )
    )
//  )
)
                                          , [])

const Editable = ({ editor, ...props }) => {
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const renderElement = useCallback(props => <Element {...props} />, [])
  return <SlateEditable
           renderLeaf={renderLeaf}
           renderElement={renderElement}
           spellCheck
           placeholder="Click here to add content..."
           onKeyDown={(event) => {
             for (const hotkey in HOTKEYS) {
               if (isHotkey(hotkey, event.nativeEvent)) {
                 event.preventDefault()
                 const mark = HOTKEYS[hotkey]
                 toggleMark(editor, mark)
               }
             }
           }}
           {...props} />
}

export default Editable
