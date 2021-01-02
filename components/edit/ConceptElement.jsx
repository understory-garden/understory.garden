import { ExternalLinkIcon } from "../icons"
import { useSelected, useEditor } from 'slate-react';
import { useWebId } from 'swrlit'

const ConceptElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const editor = useEditor()
  const conceptPrefix = "/notes/"
  return (
    <span {...attributes}>
      <span className={`underline text-blue-500 ${selected && "bg-blue-100"}`}>
        {children}
      </span>
      <a href={`${conceptPrefix}${element.name}`} contentEditable={false} className="select-none">
        <ExternalLinkIcon className="inline" />
      </a>
    </span>
  )
}
export default ConceptElement
