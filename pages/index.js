import { useState, useEffect } from 'react'
import Head from 'next/head'

import auth from 'solid-auth-client'
import {
  fetchLitDataset, getThingOne, getStringNoLocaleOne, getUrlAll, removeUrl, addUrl,
  saveLitDatasetAt, setThing, getUrlOne
} from '@solid/lit-pod'
import { foaf, vcard } from 'rdf-namespaces'

import useWebId from "../hooks/useWebId"
import useThing from "../hooks/useThing"
import Button from "../components/Button"
import {Space, Flow, Module} from "../components/layout"
import ProfileModule from "../modules/Profile"


function AuthButton(){
  const webId = useWebId()
  if (webId === undefined){
    return <div>loading...</div>
  } else if (webId === null) {
    return (
      <Button onClick={() => auth.popupLogin({ popupUri: "/popup.html" })}>
        Log In
      </Button>
    )
  } else {
    return <Button onClick={() => auth.logout()}>Log Out</Button>
  }
}

function Friends(){
  const webId = useWebId()
  const {thing: profile, save: saveProfile} = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const knows = profile && getUrlAll(profile, foaf.knows)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const [saving, setSaving] = useState(false)
  if (profile){
    return (
      <>
        {knows && knows.map(url => (
          <div key={url}>
            {url}
            <Button onClick={
                  async () => {
                    setSaving(true)
                    await saveProfile(removeUrl(profile, foaf.knows, url))
                    setSaving(false)
                  }}
                    disabled={saving}
            >
              remove knows
            </Button>
          </div>
        ))}

        <Button onClick={
                  async () => {
                    setSaving(true)
                    await saveProfile(addUrl(profile, foaf.knows, "https://lordvacon.inrupt.net/profile/card#me"))
                    setSaving(false)
                  }}
                disabled={saving}
        >
          add knows
        </Button>
      </>
    )
  } else {
    return <div>loading...</div>
  }

}

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Space>
          <Flow>
            <ProfileModule />
            <Module>
              <Friends />
            </Module>
            <Module>
              <AuthButton/>
            </Module>
          </Flow>
        </Space>
      </main>
      <footer>

      </footer>
    </div>
  )
}
