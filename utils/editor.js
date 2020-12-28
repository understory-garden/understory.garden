import { Editor, Transforms, Range, Point, Element, Text, Path } from 'slate';
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

  return editor
}

export const insertImage = (editor, attributes, at=editor.selection) => {
  const text = { text: '' }
  const image = { type: 'image', children: [text], ...attributes }
  Transforms.insertNodes(editor, image, {at})
}

export const isLinkActive = editor => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' })
  return !!link
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

export const setConceptProps = (editor, concept, name, uri) => {
  const path = ReactEditor.findPath(editor, concept)
  Transforms.setNodes(editor, {name, uri}, {at: path})
}

const unwrapConcept = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'concept' })
}

const wrapConcept = (editor, name, uri) => {
  if (isConceptActive(editor)) {
    unwrapConcept(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const concept = {
    type: 'concept',
    name,
    uri,
    children: isCollapsed ? [{ text: name }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, concept)
  } else {
    Transforms.wrapNodes(editor, concept, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}

export const removeConcept = (editor) => {
  unwrapConcept(editor)
}

export const isConceptActive = editor => {
  const [concept] = Editor.nodes(editor, { match: n => n.type === 'concept' })
  return !!concept
}

export const insertConcept = (editor, name, uri) => {
  if (editor.selection) {
    wrapConcept(editor, name, uri)
  }
}

export const withConcepts = editor => {
  const { isInline } = editor

  editor.isInline = element => (element.type === 'concept') ? true : isInline(element)
  disallowEmpty("concept", editor)

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
