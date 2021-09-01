import { useContext } from 'react'
import {
  setStringNoLocale, getStringNoLocale, getUrl, setUrl, createSolid, getThingAll, asUrl,
  getDatetime
} from '@inrupt/solid-client'
import Link from 'next/link'
import { DCTERMS } from '@inrupt/vocab-common-rdf'
import WorkspaceContext from '../contexts/WorkspaceContext'

import { conceptIdFromUri } from '../model/concept'
import { useConcepts } from '../hooks/concepts'
import NoteContext from '../contexts/NoteContext'
import { urlSafeIdToConceptName } from '../utils/uris'

export function Hex({children}) {
  return (
    <div><div>
      <div className="flex flex-col justify-center items-center bg-lagoon-dark">
        {children}
      </div>
    </div></div>
  )
}

export function HexGrid({children}) {
  return (
    <div className="grid hex gap-6 p-6">
      {children}
    </div>
  )
}

export function Note({ concept }) {
  const uri = asUrl(concept)
  const id = conceptIdFromUri(uri)
  const name = urlSafeIdToConceptName(id)
  const { path } = useContext(NoteContext)

  return (
    <Hex>
      <Link href={`${path}/${id}`}>
        <h1 className="flex items-center py-3 px-6 rounded hover:bg-lagoon-light hover:text-lagoon-dark cursor-pointer text-2xl text-lagoon-light">
          {name}
        </h1>
      </Link>
    </Hex>
  )
}

export function NotesFromConcepts({ path = "/notes", webId, concepts }) {
  const { slug: workspaceSlug } = useContext(WorkspaceContext)
  return (
    <NoteContext.Provider value={{ path: `${path}/${workspaceSlug}` }}>
      <HexGrid>
        {concepts && concepts.map(concept => <Note key={asUrl(concept)} concept={concept} />)}
      </HexGrid>
    </NoteContext.Provider>
  )
}

export default function Notes({ path = "/notes", webId }) {
  const { concepts } = useConcepts(webId)
  return (<>
    { concepts && (concepts.length > 0) && (
      <NotesFromConcepts path={path} webId={webId} concepts={concepts} />
    )}
  </>)
}
