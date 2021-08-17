import { Editor, Transforms, Range, Point, Element, Text, Path, Node } from 'slate';
import { ReactEditor} from 'slate-react';

import imageExtensions from 'image-extensions'
import isUrl from 'is-url'


const LIST_TYPES = ['numbered-list', 'bulleted-list']

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}


export const isBlockActive = (editor, format, at=editor.selection) => {
  const [match] = Editor.nodes(editor, {
    at,
    match: n => n.type === format,
  })

  return !!match
}

export const toggleBlock = (editor, format, at=editor.selection) => {
  const isActive = isBlockActive(editor, format, at)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    at,
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  }, { at })

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block, { at })
  }
}

export const makeBlock = (editor, format, at=editor.selection) => {
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    at,
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isList ? 'list-item' : format,
  }, { at })

  if (isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block, { at })
  }
}

export const insertBlock = (editor, format, at=editor.selection, attributes={}) => {
  const isList = LIST_TYPES.includes(format)
  if (format === "table") {
    Transforms.insertNodes(editor, {
      type: "table",
      children: [{
        type: "table-row",
        children: [{
          type: "table-cell",
          children: [{text: ""}]
        }]
      }],
      ...attributes
    }, { at })
  } else if (isList) {
    Transforms.insertNodes(editor, {
      type: format, children: [ { type: "list-item", children: []}],
      ...attributes
    }, { at })
  } else {
    Transforms.insertNodes(editor,
                           { type: format, children: [],
                             ...attributes
                           },
                           { at })
  }
}

export const insertRow = (editor, table) => {
  const path = ReactEditor.findPath(editor, table)
  Transforms.insertNodes(editor, {
    type: "table-row", children: Array(table.children[0].children.length).fill().map(
      () => ({ type: "table-cell", children: [{text: ""}]})
    )
  }, { at: [...path, table.children.length] })
}

export const removeRow = (editor, table) => {
  const path = ReactEditor.findPath(editor, table)
  Transforms.removeNodes(editor, { at: [...path, table.children.length - 1] })
}

export const insertColumn = (editor, table) => {
  const firstRow = table.children[0]
  const firstRowPath = ReactEditor.findPath(editor, firstRow)
  for (let i = 0; i < table.children.length; i++){
    Transforms.insertNodes(editor, {
      type: "table-cell", children: [{text: ""}]
    }, { at: [...firstRowPath.slice(0, -1), i, firstRow.children.length] })
  }
}

export const removeColumn = (editor, table) => {
  const firstRow = table.children[0]
  const firstRowPath = ReactEditor.findPath(editor, firstRow)
  for (let i = 0; i < table.children.length; i++){
    Transforms.removeNodes(editor, {
      at: [...firstRowPath.slice(0, -1), i, firstRow.children.length - 1]
    })
  }
}

const isImageUrl = url => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}

export const withImages = editor => {
  const { insertData, isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }
/*
  // this currently inserts images inline in the page which is not at all ideal, disable for now
  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, {url})
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, {url: text})
    } else {
      insertData(data)
    }
  }
*/
  return editor
}

export const insertImage = (editor, attributes, at=editor.selection) => {
  const text = { text: '' }
  const image = { type: 'image', children: [text], ...attributes }
  Transforms.insertNodes(editor, image, {at})
}


export const activeLink = (editor, at=editor.selection) => {
  const [linkPath] = Editor.nodes(editor, {at,  match: n => n.type === 'link' })
  if (linkPath){
    const [node] =  linkPath
    return node
  } else {
    return null
  }
}

export const isLinkActive = editor => {
  return !!activeLink(editor)
}

const unwrapLink = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' })
}

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

const disallowEmpty = (type, editor) => {
  const { normalizeNode } = editor

  editor.normalizeNode = entry => {
    const [node, path] = entry
    if (Element.isElement(node) && (node.type === type) &&
        (node.children.length === 1) && Text.isText(node.children[0]) &&
        (node.children[0].text === "")) {
      const currentlySelected = Path.isCommon(path, editor.selection.anchor.path)
      Transforms.removeNodes(editor, {at: path})
      if (currentlySelected) {
        Transforms.select(editor, path)
        Transforms.collapse(editor)
      }
    }
    normalizeNode(entry)
  }
}

export const withLinks = editor => {
  const { insertData, insertText, isInline } = editor

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')

    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertData(data)
    }
  }

  disallowEmpty("link", editor)

  return editor
}

export const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
}

export const removeLink = (editor) => {
  unwrapLink(editor)
}

export const setLinkUrl = (editor, link, url) => {
  const path = ReactEditor.findPath(editor, link)
  Transforms.setNodes(editor, {url}, {at: path})
}

export const setlonceptProps = (editor, concept, name) => {
  const path = ReactEditor.findPath(editor, concept)
  Transforms.setNodes(editor, {name}, {at: path})
}

const unwrapConcept = editor => {
  const [_, path] = activeConceptEntry(editor)
  Editor.withoutNormalizing(editor, () => {
    Transforms.delete(editor, {at: Editor.start(editor, path), unit: 'character', distance: 2})
    Transforms.delete(editor, {at: Editor.end(editor, path), unit: 'character', distance: 2, reverse: true})
  })
  // normalization will delete the concept now that it doesn't have the right text content
}

const wrapConcept = (editor, {at = editor.selection} = {}) => {
  // MUST do end first or else cursor will be in the wrong spot
  Transforms.insertText(editor, "]]", {at: Range.end(at)})
  Transforms.insertText(editor, "[[", {at: Range.start(at)})
  // normalization will turn this into a concept
}

export const removeConcept = (editor) => {
  unwrapConcept(editor)
}

export const activeConceptEntry = editor => {
  const [concept] = Editor.nodes(editor, { match: n => n.type === 'concept' })
  return concept
}

export const isConceptActive = editor => {
  return !!activeConceptEntry(editor)
}

export const makeSelectionConcept = (editor) => {
  if (editor.selection) {
    wrapConcept(editor)
  }
}

export const insertConcept = (editor, name) => {
  const concept = {
    type: 'concept',
    name,
    children: [{ text: `[[${name}]]` }],
  }
  Transforms.insertNodes(editor, concept)
}

const conceptRegex = /\[\[(.+)\]\]/

function hasConceptParent(editor, path){
  const parent = Node.get(editor, path.slice(0, -1))
  if (parent.type === "concept"){
    return true
  } else {
    return false
  }
}

export const withConcepts = editor => {
  const { isInline, insertText, deleteBackward, normalizeNode } = editor

  editor.isInline = element => (element.type === 'concept') ? true : isInline(element)

  editor.normalizeNode = entry => {
    const [node, path] = entry
    if (Text.isText(node) && !hasConceptParent(editor, path)){
      const conceptMatch = node.text.match(conceptRegex)
      if (conceptMatch){
        const {index, 0: match, 1: name} = conceptMatch
        const at = {anchor: {path, offset: index}, focus: {path, offset: index + match.length}}
        Transforms.wrapNodes(editor, {type: "concept", children: []}, { at, split: true })
        return
      }
    } else if (node.type === "concept"){
      const conceptMatch = Node.string(node).match(conceptRegex)
      if (conceptMatch){
        const [_, name] = conceptMatch
        if (node.name !== name){
          Transforms.setNodes(editor, {name}, {at: path})
          return
        }
      } else {
        Transforms.unwrapNodes(editor, { match: n => n.type === 'concept' })
        return
      }
    }

    normalizeNode(entry)
  }

  return editor
}

const tagRegex = /\B\#([\w-]+)\b/

function hasTagParent(editor, path){
  const parent = Node.get(editor, path.slice(0, -1))
  if (parent.type === "tag"){
    return true
  } else {
    return false
  }
}

export const withTags = editor => {
  const { isInline, insertText, deleteBackward, normalizeNode } = editor

  editor.isInline = element => (element.type === 'tag') ? true : isInline(element)

  editor.normalizeNode = entry => {
    const [node, path] = entry
    if (Text.isText(node) && !hasTagParent(editor, path)){
      const tagMatch = node.text.match(tagRegex)
      if (tagMatch){
        const {index, 0: match, 1: name} = tagMatch
        const at = {anchor: {path, offset: index}, focus: {path, offset: index + match.length}}
        Transforms.wrapNodes(editor, {type: "tag", children: []}, { at, split: true })
        return
      }
    } else if (node.type === "tag"){
      const tagMatch = Node.string(node).match(tagRegex)
      if (tagMatch){
        const [_, name] = tagMatch
        if (node.name !== name){
          Transforms.setNodes(editor, {name}, {at: path})
          return
        }
      } else {
        Transforms.unwrapNodes(editor, { match: n => n.type === 'tag' })
        return
      }
    }

    normalizeNode(entry)
  }

  return editor
}

export const withChecklists = editor => {
  const { deleteBackward } = editor

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === 'check-list-item',
      })

      if (match) {
        const [, path] = match
        const start = Editor.start(editor, path)

        if (Point.equals(selection.anchor, start)) {
          Transforms.setNodes(
            editor,
            { type: 'paragraph' },
            { match: n => n.type === 'check-list-item' }
          )
          return
        }
      }
    }

    deleteBackward(...args)
  }

  return editor
}

export const withLists = editor => {
  const { deleteBackward } = editor

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === 'list-item',
      })
      if (match) {
        const [, path] = match
        const start = Editor.start(editor, path)
        if (Point.equals(selection.anchor, start)) {
          Transforms.unwrapNodes(editor, {
            match: n => LIST_TYPES.includes(n.type),
            split: true,
          })

          Transforms.setNodes(
            editor,
            { type: 'paragraph' },
            { match: n => n.type === 'list-item' }
          )
          return
        }
      }
    }

    deleteBackward(...args)
  }

  return editor
}

export const withTables = editor => {
  const { deleteBackward, deleteForward, insertBreak } = editor

  editor.deleteBackward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
      })

      if (cell) {
        const [, cellPath] = cell
        const start = Editor.start(editor, cellPath)

        if (Point.equals(selection.anchor, start)) {
          return
        }
      }
    }

    deleteBackward(unit)
  }

  editor.deleteForward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => n.type === 'table-cell',
      })

      if (cell) {
        const [, cellPath] = cell
        const end = Editor.end(editor, cellPath)

        if (Point.equals(selection.anchor, end)) {
          return
        }
      }
    }

    deleteForward(unit)
  }

  editor.insertBreak = () => {
    const { selection } = editor

    if (selection) {
      const [table] = Editor.nodes(editor, { match: n => n.type === 'table' })

      if (table) {
        return
      }
    }

    insertBreak()
  }

  return editor
}

export const withEmbeds = editor => {
  const { isVoid } = editor
  editor.isVoid = element => (element.type === 'embed' ? true : isVoid(element))
  return editor
}

export const insertionPoint = (editor, element) => {
  const path = ReactEditor.findPath(editor, element)
  return (
    [...path.slice(0, -1), path.slice(-1)[0] + 1]
  )
}

const SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six'
}

export const withShortcuts = editor => {
  const { deleteBackward, insertText } = editor

  editor.insertText = text => {
    const { selection } = editor

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range)
      const type = SHORTCUTS[beforeText]

      if (type) {
        Transforms.select(editor, range)
        Transforms.delete(editor)
        const newProperties = {
          type,
        }
        Transforms.setNodes(editor, newProperties, {
          match: n => Editor.isBlock(editor, n),
        })

        if (type === 'list-item') {
          const list = { type: 'bulleted-list', children: [] }
          Transforms.wrapNodes(editor, list, {
            match: n =>
              !Editor.isEditor(n) &&
              Element.isElement(n) &&
              n.type === 'list-item',
          })
        }

        return
      }
    }

    insertText(text)
  }

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)

        if (
          !Editor.isEditor(block) &&
          Element.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties = {
            type: 'paragraph',
          }
          Transforms.setNodes(editor, newProperties)

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                n.type === 'bulleted-list',
              split: true,
            })
          }

          return
        }
      }

      deleteBackward(...args)
    }
  }

  return editor
}
