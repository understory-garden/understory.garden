import { useState, useCallback } from 'react'
import { useAuthentication, useLoggedIn, useMyProfile, useProfile, useWebId, useEnsured } from 'swrlit'
import {
  setStringNoLocale, getStringNoLocale, getUrl, setUrl, createSolid, getThingAll, asUrl,
  getDatetime
} from '@inrupt/solid-client'
import { FOAF, AS, RDF, RDFS, DCTERMS } from '@inrupt/vocab-common-rdf'
import { WS } from '@inrupt/vocab-solid-common'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useConceptIndex } from '../hooks/concepts'
import { useStorageContainer, useFacebabyContainerUri } from '../hooks/uris'
import { conceptNameFromUri } from '../model/concept'
import { profilePath } from '../utils/uris'
import Nav from '../components/nav'
import Notes from '../components/Notes'
import Follows from '../components/Follows'

function LoginUI(){
  const [handle, setHandle] = useState("")
  const [badHandle, setBadHandle] = useState(false)
  const { loginHandle, logout } = useAuthentication()
  async function logIn(){
    setBadHandle(false)
    try {


      await loginHandle(handle);
    } catch (e) {
      console.log("error:", e)
      setBadHandle(true)
    }
  }
  function onChange(e){
    setHandle(e.target.value)
    setBadHandle(false)
  }
  function onKeyPress(e){
    if (e.key === "Enter"){
      logIn()
    }
  }
  return (
    <div className="flex flex-col">
      <input type="text" className="pl-2 w-2/3 m-auto font-logo text-2xl rounded text-center text-black"
             placeholder="what's your handle?"
             value={handle} onChange={onChange} onKeyPress={onKeyPress}/>
      {badHandle && (
        <p className="text-xs text-red-500 m-auto mt-1">
          hm, I don't recognize that handle
        </p>
      )}
      <button className="bg-black text-white mt-6 text-3xl font-logo" onClick={logIn}>log in</button>
    </div>
  )
}

function NewNoteForm(){
  const router = useRouter()
  const [noteName, setNoteName] = useState("")
  const onCreate = useCallback(function onCreate(){
    router.push(`/notes/${encodeURIComponent(noteName)}`)
  })
  return (
    <div className="flex flex-row m-auto my-12">
      <input value={noteName} onChange={e => setNoteName(e.target.value)} className="input-text mr-3 bg-gray-900" type="text" placeholder="New Note Name" />
      <button className="btn" onClick={onCreate}>
        Create Note
      </button>
    </div>
  )
}

export default function IndexPage() {
  const loggedIn = useLoggedIn()
  const { profile, save: saveProfile } = useMyProfile()
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const [newName, setNewName] = useState("")
  async function onSave(){
    return await saveProfile(setStringNoLocale(profile, FOAF.name, newName))
  }

  const webId = useWebId()
  const appContainerUri = useFacebabyContainerUri(webId)

  return (
    <div className="bg-black text-white h-screen p-6">
      <Nav />
      { (loggedIn === true) ? (
        <div className="px-6">
          <div className="flex flex-row justify-between py-6">
            {name && (
              <h3 className="text-4xl text-center font-logo">you are {name}</h3>
            )}
            <div className="flex flex-row justify-center">
              <input value={newName} onChange={e => setNewName(e.target.value)} className="input-text bg-gray-900 mr-3" type="text" placeholder="New Name" />
              <button className="btn" onClick={onSave}>
                Set Name
              </button>
            </div>
          </div>
          <h5 className="text-xl text-center font-logo">
            <Link href={`${profilePath(webId)}`}>
              <a>
                public profile
              </a>
            </Link>
          </h5>
          <div className="flex">
            <div className="mr-6">
              <NewNoteForm />
              <Notes webId={webId}/>
            </div>
            <Follows />
          </div>
        </div>
      ) : (
        ((loggedIn === false) || (loggedIn === null)) ? (
          <>
            <div className="py-20">
              <h1 className="text-6xl text-center bold font-logo text-white">
                FACE
              </h1>
              <h1 className="text-6xl text-center bold font-logo text-white">
                BABY
              </h1>
            </div>
            <LoginUI/>
          </>
        ) : (
          <div>
            loading....
          </div>
        )
      ) }
    </div>
  )
}
