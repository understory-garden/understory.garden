import { useState, useCallback } from 'react'
import { useResource, useAuthentication, useLoggedIn, useMyProfile, useProfile, useWebId, useEnsured } from 'swrlit'
import {
  setStringNoLocale, getStringNoLocale, getUrl, setUrl, createSolid, getThingAll, asUrl,
  getDatetime
} from '@inrupt/solid-client'
import { FOAF, AS, RDF, RDFS, DCTERMS } from '@inrupt/vocab-common-rdf'
import { WS } from '@inrupt/vocab-solid-common'
import { US } from "../vocab"
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useConceptIndex } from '../hooks/concepts'
import { useStorageContainer } from '../hooks/uris'
import { conceptNameFromUri } from '../model/concept'
import { profilePath, conceptNameToUrlSafeId } from '../utils/uris'
import Nav from '../components/nav'
import { Loader } from '../components/elements'
import Notes from '../components/Notes'
import TabButton from '../components/TabButton'
import { EditIcon } from '../components/icons'
import WebMonetization from '../components/WebMonetization'
import { useApp, useWorkspace } from '../hooks/app'
import { WorkspaceProvider } from '../contexts/WorkspaceContext'

export default function Welcome() {
  const [username, setUsername] = useState("")
  const [badHandle, setBadHandle] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const { loginHandle, logout } = useAuthentication()
  const handle = username.includes(".") ? username : `${username}.myunderstory.com`
  async function logIn() {
    setBadHandle(false)
    setLoggingIn(true)
    try {
      await loginHandle(handle);
    } catch (e) {
      console.log("error:", e)
      setBadHandle(true)
      setLoggingIn(false)
    }
  }
  function onChange(e) {
    setUsername(e.target.value)
    setBadHandle(false)
  }
  function onKeyPress(e) {
    if (e.key === "Enter") {
      logIn()
    }
  }
  return (
    <div className="max-w-5xl mx-auto">
      <div className="my-12">
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-logo">
          Welcome to the
        </h2>
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold font-logo">
          Mysilio Network
        </h1>
      </div>
      If you already have a Pod with us, just let us know which one and we'll get you logged in:
      <input type="text" className="pl-2 w-2/3 m-auto text-2xl rounded text-center text-black"
        placeholder="what is your username?"
        value={username} onChange={onChange} onKeyPress={onKeyPress} />
      {badHandle && (
        <p className="text-red-500 m-auto mt-2">
          hm, I don't recognize that username
        </p>
      )}
      {loggingIn ? (
        <Loader className="flex flex-row justify-center" />
      ) : (
          <button className="btn mt-6 p-3 text-3xl flex-auto block m-auto hover:shadow-md" onClick={logIn}>
            log in
          </button>
        )}
      <p className="mt-3 text-gray-500">By logging in you agree to be bound by our <a href="/tos">Terms of Service</a></p>
    </div>
  )
}
