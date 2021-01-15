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
import { Loader } from '../components/elements'
import Notes from '../components/Notes'
import Follows from '../components/Follows'
import Feed from '../components/Feed'
import TabButton from '../components/TabButton'

function LoginUI(){
  const [handle, setHandle] = useState("")
  const [badHandle, setBadHandle] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const { loginHandle, logout } = useAuthentication()
  async function logIn(){
    setBadHandle(false)
    setLoggingIn(true)
    try {
      await loginHandle(handle);
    } catch (e) {
      console.log("error:", e)
      setBadHandle(true)
    } finally {
      setLoggingIn(false)
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
      {loggingIn ? (
        <Loader/>
      ) : (
        <button className="mt-6 text-3xl font-logo" onClick={logIn}>log in</button>
      )}
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
    <div className="flex flex-row m-auto my-6">
      <input value={noteName} onChange={e => setNoteName(e.target.value)} className="input-text mr-3 bg-gray-900" type="text" placeholder="New Note Name" />
      <button className="btn" onClick={onCreate} disabled={noteName === ""}>
        Create Note
      </button>
    </div>
  )
}

export default function IndexPage() {
  const loggedIn = useLoggedIn()
  const { profile, save: saveProfile } = useMyProfile()
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const profileImage = profile && getUrl(profile, FOAF.img)
  const [newName, setNewName] = useState("")
  async function onSave(){
    return await saveProfile(setStringNoLocale(profile, FOAF.name, newName))
  }

  const webId = useWebId()
  const appContainerUri = useFacebabyContainerUri(webId)
  const [tab, setTab] = useState("feed")
  return (
    <div className="page" id="page">
      <Nav />
      { (loggedIn === true) ? (
        <div className="px-6">
          <div className="flex flex-row py-6 justify-between">
            <div className="flex flex-row">
              {profileImage && <img className="rounded-full h-36 w-36 object-cover mr-12" src={profileImage} /> }
              <div className="flex flex-col mr-12">
                {name && (
                  <h3 className="text-4xl text-center font-logo mb-3">{name}</h3>
                )}
                <div className="flex flex-row justify-center">
                  <input value={newName} onChange={e => setNewName(e.target.value)} className="input-text bg-gray-900 mr-3" type="text" placeholder="New Name" />
                <button className="btn" onClick={onSave}>
                  Set Name
                </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h5 className="text-xl text-center font-logo mb-6">
                <Link href={`${profilePath(webId)}`}>
                  <a>
                    public profile
                  </a>
                </Link>
              </h5>
              <h5 className="text-xl text-center font-logo">
                <Link href={`${profilePath(webId)}/message`}>
                  <a>
                    send message
                  </a>
                </Link>
              </h5>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="mr-6 flex-grow">
              <NewNoteForm />
              <div className="flex mb-6">
                <TabButton name="feed" activeName={tab} setTab={setTab}>
                  feed
                </TabButton>
                <TabButton name="notes" activeName={tab} setTab={setTab}>
                  notes
                </TabButton>
                <TabButton name="following" activeName={tab} setTab={setTab}>
                  following
                </TabButton>
              </div>
              {tab === "notes" ? (
                <Notes webId={webId}/>
              ) : (tab === "feed" ? (
                <Feed/>
              ) : (tab === "following" ? (
                <Follows />
              ) : (
                <div className="font-logo">
                  you are in a maze of twisty passages, all alike
                </div>
              )
              ))}
            </div>
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
