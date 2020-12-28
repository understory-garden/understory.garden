import { schema } from 'rdf-namespaces';
import { getStringNoLocale } from '@inrupt/solid-client';
import ReactMarkdown from 'react-markdown'

export default function Note({ note }){
  const text = getStringNoLocale(note, schema.text)

  return (
    <div>
      <ReactMarkdown children={text} />
    </div>
  )
}
