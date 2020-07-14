import { useState } from "react"

import {
  getUrlAll, removeUrl, addUrl
} from '@solid/lit-pod'
import auth from "solid-auth-client"
import { foaf } from "rdf-namespaces"

import useWebId from "../hooks/useWebId"
import useThing from "../hooks/useThing"
import { Flow, Module } from "../components/layout"
import { Button } from "../components/elements"
import ProfileModule from "../modules/Profile"

function AuthButton() {
  const webId = useWebId()
  if (webId === undefined) {
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

function Friends() {
  const webId = useWebId()
  const { thing: profile, save: saveProfile } = useThing(webId)
  const knows = profile && getUrlAll(profile, foaf.knows)
  const [saving, setSaving] = useState(false)
  if (profile) {
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


export default () => {
  return (
    <Flow>
      <ProfileModule />
      <Module>
        <Friends />
      </Module>
      <Module>
        <AuthButton />
      </Module>
    </Flow>
  )
}
