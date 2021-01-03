import { ExternalLinkIcon } from "../icons"
import { useSelected, useEditor } from 'slate-react';
import { useWebId } from 'swrlit'
import Link from 'next/link'

const ConceptElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  const conceptPrefix = "/notes/"
  return (
    <span {...attributes}>
      <span className={`underline text-blue-500 ${selected && "bg-blue-100"}`}>
        {children}
      </span>
      <Link href={`${conceptPrefix}${element.name}`}>
        <a contentEditable={false} className="select-none">
          <ExternalLinkIcon className="inline" />
        </a>
      </Link>
    </span>
  )
}
export default ConceptElement
