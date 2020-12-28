import { useState } from 'react'
import { useAuthentication, useLoggedIn, useMyProfile, useProfile, useWebId, useEnsured } from 'swrlit'
import {
  setStringNoLocale, getStringNoLocale, getUrl, setUrl
} from '@inrupt/solid-client'
import { FOAF, AS, RDF, RDFS } from '@inrupt/vocab-common-rdf'
import { WS } from '@inrupt/vocab-solid-common'

import { useStorageContainer, useFacebabyContainerUri } from '../hooks/uris'

import Nav from '../components/nav'

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
      <input type="text" className="pl-2 w-2/3 m-auto font-logo text-2xl rounded text-center"
             placeholder="what's your handle?"
             value={handle} onChange={onChange} onKeyPress={onKeyPress}/>
      {badHandle && (
        <p className="text-xs text-red-500 m-auto mt-1">
          hm, I don't recognize that handle
        </p>
      )}
      <button className="text-white mt-6 text-3xl font-logo" onClick={logIn}>log in</button>
    </div>
  )
}

export function useStorageContainer(webId) {
  const { profile } = useProfile(webId)
  return profile && getUrl(profile, WS.storage)
}

export function useFacebabyContainerUri(webId, path = 'public') {
  const storageContainer = useStorageContainer(webId)
  return useEnsured(storageContainer && `${storageContainer}${path}/itme/facebaby/`)
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
    <div className="bg-black h-screen">
      <Nav />
      { (loggedIn === true) ? (
        <div>
          {name && (
            <h5 className="text-4xl text-center text-white font-logo">you are {name}</h5>
          )}
          <div className="flex flex-row m-auto justify-center">
            <input value={newName} onChange={e => setNewName(e.target.value)} className="input-text mr-3" type="text" placeholder="New Name" />
            <button className="btn text-white" onClick={onSave}>
              Set Name
            </button>
          </div>

          <h1 className="text-6xl text-center bold font-logo text-white">
            ANY QUESTIONS?
          </h1>
        </div>
      ) : (
        (loggedIn === false) ? (
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
