import { useContext } from 'react'
import { useSelected, useEditor } from 'slate-react';
import { useWebId } from 'swrlit'
import Link from 'next/link'
import { Popover } from 'react-tiny-popover'

import { ExternalLinkIcon } from "../icons"
import { getConceptNameFromNode } from '../../utils/slate'
import NoteContext from '../../contexts/NoteContext'

const ConceptElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  const { path } = useContext(NoteContext)
  const noteUrl = `${path}/${encodeURIComponent(getConceptNameFromNode(element))}`
  return (
    <Popover isOpen={selected}
             positions={['bottom', 'right', 'top', 'left']}
             content={
               <div className="rounded-sm shadow-sm bg-white ring-1 ring-black ring-opacity-5 py-1 px-2">
                 <Link href={noteUrl}>
                   <a className="text-blue-500 underline">
                     {location.hostname}{noteUrl}
                     <ExternalLinkIcon className="inline" />
                   </a>
                 </Link>
               </div>
             }>
      <span {...attributes} className="text-blue-500">
        {children}
      </span>
    </Popover>
  )
}
export default ConceptElement
