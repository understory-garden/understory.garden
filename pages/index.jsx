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
import { EditIcon } from '../components/icons'
import WebMonetization from '../components/WebMonetization'
import { useApp, useWorkspace } from '../hooks/app'
import { WorkspaceProvider } from '../contexts/WorkspaceContext'
import Welcome from '../onboarding/Welcome'

function Dashboard() {
  const webId = useWebId()
  const loggedIn = useLoggedIn()
  const { profile, save: saveProfile } = useMyProfile()
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const { workspace } = useWorkspace(webId)
  const [tab, setTab] = useState("notes")
  return (
    <>
      <WebMonetization webId={webId} />
      <Nav />
      <div className="px-6">
        <WorkspaceProvider webId={webId} slug={'default'}>
          <div className="flex justify-between">
            <div className="mr-6 flex-grow">
                <Notes webId={webId} />
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
              <Welcome/>
            </div>
          ) : (
              <Loader className="flex flex-row justify-center mt-36" />
            )
        )}
    </div>
  )
}
