import { ExternalLinkIcon } from "../icons"
import { useSelected, useEditor } from 'slate-react';
import { useWebId } from 'swrlit'
import Link from 'next/link'
import { getConceptNameFromNode } from '../../utils/slate'

const ConceptElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  const conceptPrefix = "/notes/"
  return (
    <span {...attributes}>
      <span className="underline text-blue-500" contentEditable={false}>[[</span>
      <span className="concept underline text-blue-500">
        {children}
      </span>
      <span className="underline text-blue-500" contentEditable={false}>]]</span>
      <Link href={`${conceptPrefix}${encodeURIComponent(getConceptNameFromNode(element))}`}>
        <a contentEditable={false} className="select-none">
          <ExternalLinkIcon className="inline" />
        </a>
      </Link>
    </span>
  )
}
export default ConceptElement
