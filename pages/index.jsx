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
import Follows from '../components/Follows'
import TabButton from '../components/TabButton'
import { EditIcon } from '../components/icons'
import WebMonetization from '../components/WebMonetization'
import { useNeedsDowncaseMigration } from '../components/DowncaseMigrator'
import { useApp, useWorkspace } from '../hooks/app'
import { WorkspaceProvider } from '../contexts/WorkspaceContext'

function LoginUI() {
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
      {/*
      <Link href="/register">
        <a className="text-4xl block">create your account</a>
      </Link>
      <h3 className="text-3xl my-6">OR</h3>
      <Link href="/login">
        <a className="text-4xl">get a magic login link</a>
      </Link>
      <h3 className="text-3xl my-6">OR</h3>
      <h3 className="text-3xl mb-3 text-gray-800">login with your handle</h3>
       */}
      <h3 className="text-3xl mb-3 text-gray-700">🌻🌿🌱 Welcome to Understory Garden! 🌱🌿🌻 </h3>
      <h3 className="text-lg mb-3 text-gray-600">
        We're hard at work laying the foundations for you to build your
        new <a href="https://understory.coop/">Home on the Web</a>.
      </h3>
      <h3 className="text-lg mb-3 text-gray-600">
        If you already have a <a href="https://solidproject.org/">Solid Pod</a> you can use its hostname
        as your "username" below. If you don't have a Pod, you can get one
        from a <a href="https://solidproject.org/users/get-a-pod">number of providers</a> around the Web,
        but please be warned that the user experience is currently pretty rough! We're working on it 😉
      </h3>
      <h3 className="text-lg mb-3 text-gray-600">
        Unfortunately we are not currently compatible with Inrupt Pod Spaces but plan to support Pods
        from this service in the future. If you would like to host your Pod with Inrupt, please
        use <a href="https://inrupt.net">inrupt.net</a>
      </h3>
      <h3 className="text-lg mb-12 text-gray-600">Please note that we can't provide any guarantees as to the safety or security of your Pod data at this point - there may be bugs that delete all of your data or expose it to the open Web, so for now please just treat this like a sandbox.</h3>
      <input type="text" className="pl-2 w-2/3 m-auto text-2xl rounded text-center text-black"
        placeholder="what's your username?"
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

function Dashboard() {
  const webId = useWebId()
  const loggedIn = useLoggedIn()
  const { profile, save: saveProfile } = useMyProfile()
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const { workspace } = useWorkspace(webId)
  const [tab, setTab] = useState("notes")
  const needsDowncaseMigration = useNeedsDowncaseMigration()
  return (
    <>
      <WebMonetization webId={webId} />
      <Nav />
      <div className="px-6">
        <h3 className="text-xl">hi {name}!</h3>
        <WorkspaceProvider webId={webId} slug={'default'}>
          <div className="flex justify-between">
            <div className="mr-6 flex-grow">
              {false && oldConceptIndex && (
                <div>
                  It looks like you have some itme.online data. You can
                  visit <Link href="/migrate"><a>the migration page</a></Link> to migrate it.
                </div>
              )}
              {needsDowncaseMigration ? (
                <>
                <h2 className="text-2xl mb-1">migration required</h2>
                <p className="font-normal mb-1">
                  Hello! Before you use Understory Garden you'll need to migrate your
                  data to the new format. Please head to <Link href="/migrate"><a>the migration page</a></Link>
                  &nbsp;to complete the migration.
                </p>
                </>
              ) : (
                  <>
                    <div className="flex mb-6">
                      <TabButton name="notes" activeName={tab} setTab={setTab}>
                        notes
                      </TabButton>
                      <TabButton name="following" activeName={tab} setTab={setTab}>
                        following
                      </TabButton>
                    </div>
                    {tab === "notes" ? (
                      <Notes webId={webId} />
                    ) : (tab === "following" ? (
                      <Follows />
                    ) : (
                        <div className="font-logo">
                          you are in a maze of twisty passages, all alike
                        </div>
                      )
                      )}
                  </>
                )}

            </div>
          </div>
        </WorkspaceProvider>
      </div>
    </>
  )
}

function InitPage({ initApp }) {
  return (
    <>
      <Nav />
      <div className="text-center pt-12">
        <h3 className="text-xl pb-6">looks like this is your first time here!</h3>
        <button className="btn" onClick={initApp}>get started</button>
      </div>
    </>
  )
}

function LoadingPage() {
  return (
    <>
      <div className="text-center h-full w-full">
        <Loader className="absolute top-1/2 left-1/2" />
      </div>
    </>
  )
}

export default function IndexPage() {
  const loggedIn = useLoggedIn()
  const webId = useWebId()
  const { app, initApp, error: appError } = useApp(webId)
  return (
    <div className="page" id="page">
      {(loggedIn === true) ? (
        app ? (
          <Dashboard />
        ) : ((appError && (appError.statusCode === 404)) ? (
          <InitPage initApp={initApp} />
        ) : (
            <LoadingPage />
          )
          )
      ) : (
          ((loggedIn === false) || (loggedIn === null)) ? (
            <div className="text-center">
              <div className="my-12 logo-bg">
                <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold font-logo text-transparent">
                  understory
                </h1>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-logo text-transparent">
                  garden
                </h1>
              </div>
              <LoginUI />
            </div>
          ) : (
              <Loader className="flex flex-row justify-center mt-36" />
            )
        )}
    </div>
  )
}
