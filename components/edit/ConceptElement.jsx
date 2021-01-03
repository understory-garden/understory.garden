import { useSelected, useEditor } from 'slate-react';
import { useWebId } from 'swrlit'
import Link from 'next/link'
import { Popover } from 'react-tiny-popover'

import { ExternalLinkIcon } from "../icons"
import { getConceptNameFromNode } from '../../utils/slate'

const ConceptElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  const conceptPrefix = "/notes/"
  const noteUrl = `${conceptPrefix}${encodeURIComponent(getConceptNameFromNode(element))}`
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
