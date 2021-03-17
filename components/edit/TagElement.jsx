import { useContext } from 'react'
import { useSelected, useEditor, useReadOnly } from 'slate-react';
import { useWebId } from 'swrlit'
import Link from 'next/link'
import { Popover } from 'react-tiny-popover'

import { ExternalLinkIcon } from "../icons"
import { getTagNameFromNode } from '../../utils/slate'
import { useWorkspaceContext } from '../../contexts/WorkspaceContext'
import { tagNameToUrlSafeId } from '../../utils/uris'

const TagElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  const readOnly = useReadOnly()
  const { slug: workspaceSlug } = useWorkspaceContext()
  const tagUrl = `/tags/${workspaceSlug}/${tagNameToUrlSafeId(getTagNameFromNode(element))}`
  return readOnly ? (
    <Link href={tagUrl}>
      <a className="text-blue-500">{children}</a>
    </Link>
  ) : (
    <Popover isOpen={selected}
             positions={['bottom', 'right', 'top', 'left']}
             content={
               <div className="rounded-sm shadow-sm bg-white ring-1 ring-black ring-opacity-5 py-1 px-2">
                 <Link href={tagUrl}>
                   <a className="text-blue-500 underline">
                     {location.hostname}{tagUrl}
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
export default TagElement
