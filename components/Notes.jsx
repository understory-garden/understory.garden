import { useContext } from 'react'
import {
  setStringNoLocale, getStringNoLocale, getUrl, setUrl, createSolid, getThingAll, asUrl,
  getDatetime
} from '@inrupt/solid-client'
import Link from 'next/link'
import { DCTERMS } from '@inrupt/vocab-common-rdf'

import { conceptNameFromUri } from '../model/concept'
import { useConcepts } from '../hooks/concepts'
import NoteContext from '../contexts/NoteContext'

function Note({concept}){
  const uri = asUrl(concept)
  const nameInUri = conceptNameFromUri(uri)
  const name = decodeURIComponent(nameInUri)
  const { path } = useContext(NoteContext)

  return (
    <li className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200 overflow-x-scroll">
      <Link href={`${path}/${nameInUri}`}>
        <a>
          <div className="w-full flex flex-col items-center justify-between p-6 space-x-6">
            <h3 className="text-gray-900 text-xl font-medium truncate text-center">
              {name}
            </h3>
          </div>
        </a>
      </Link>
    </li>
  )
}

export default function Notes({path = "/notes", webId}){
  const { concepts } = useConcepts(webId)
  return (
    <NoteContext.Provider value={{path}}>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {concepts && concepts.map(concept => <Note key={asUrl(concept)} concept={concept}/>)}
      </ul>
    </NoteContext.Provider>
  )
}
