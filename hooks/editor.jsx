import { useCallback, useState, useMemo } from 'react'
import { Editor, Transforms, Range } from 'slate'
import Fuse from 'fuse.js'
import { useWebId } from 'swrlit'
import { asUrl } from '@inrupt/solid-client'

import { conceptIdFromUri } from '../model/concept'
import { urlSafeIdToConceptName } from '../utils/uris'
import { insertConcept } from '../utils/editor'

import { useConcepts } from './concepts'


function searchForOpenConcepts(editor){
  const { selection } = editor
  if (selection && Range.isCollapsed(selection)){
    const [start] = Range.edges(selection)
    const before = {...start, offset: 0}
    const beforeRange = before && Editor.range(editor, before, start)
    const beforeText = beforeRange && Editor.string(editor, beforeRange)
    const beforeMatch = beforeText && beforeText.match(/\[\[([^\]]*)$/)
    const conceptStart = before && beforeMatch && {path: before.path, offset: beforeMatch && beforeMatch.index}
    const conceptRange = conceptStart && Editor.range(editor, conceptStart, start)
    const conceptText = conceptRange && Editor.string(editor, conceptRange)
    const conceptMatch = conceptText && conceptText.match(/\[\[([^\]]*)$/)
    const after = Editor.after(editor, start)
    const afterRange = Editor.range(editor, start, after)
    const afterText = Editor.string(editor, afterRange)
    const afterMatch = afterText.match(/^(\s|$)/)
    if (conceptMatch && afterMatch) {
      return {target: conceptRange, search: conceptMatch[1]}
    }
  }
}

function useConceptNamesMatching(search){
  const [fuse] = useState(new Fuse([], {includeScore: true}))
  const webId = useWebId()
  const { concepts } = useConcepts(webId)
  return useMemo(function findMatchingConceptNames(){
    if (search){
      const names = concepts && concepts.map(concept => urlSafeIdToConceptName(conceptIdFromUri(asUrl(concept))))
      fuse.setCollection(names)
      const result = fuse.search(search)
      return result.map(({item}) => item)
    }
  }, [concepts, search])
}


export function useConceptAutocomplete(editor){
  const [target, setTarget] = useState()
  const [search, setSearch] = useState()
  const [selectionIndex, setPopoverSelectionIndex] = useState()
  const names = useConceptNamesMatching(search)

  const onChange = useCallback(function onChange(){
    const openConcepts = searchForOpenConcepts(editor)
    if (openConcepts){
      setTarget(openConcepts.target)
      setSearch(openConcepts.search)
      setPopoverSelectionIndex(0)
    } else {
      setTarget(null)
      setSearch(null)
    }
  }, [editor])

  const onKeyDown = useCallback(
    event => {
      if (target && names) {
        switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          const prevIndex = selectionIndex >= names.length - 1 ? 0 : selectionIndex + 1
          setPopoverSelectionIndex(prevIndex)
          break
        case 'ArrowUp':
          event.preventDefault()
          const nextIndex = selectionIndex <= 0 ? names.length - 1 : selectionIndex - 1
          setPopoverSelectionIndex(nextIndex)
          break
        case 'Tab':
        case 'Enter':
          event.preventDefault()
          Transforms.select(editor, target)
          insertConcept(editor, names[selectionIndex])
          setTarget(null)
          break
        case 'Escape':
          event.preventDefault()
          setTarget(null)
          break
        }
      }
    },
    [selectionIndex, search, target, names]
  )


  return {onChange, onKeyDown, names, target, selectionIndex}
}
