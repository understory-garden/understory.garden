import {
  getUrlAll, removeUrl, addUrl, getUrlOne, getStringNoLocaleOne
} from '@solid/lit-pod'
import auth from "solid-auth-client"
import { foaf, vcard } from "rdf-namespaces"

import useWebId from "../hooks/useWebId"
import useThing from "../hooks/useThing"
import { Flow, Module } from "../components/layout"
import { Button } from "../components/elements"
import ProfileModule from "../modules/Profile"
import { otherPath } from "../lib/urls"

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

function Friend({ webId, ...rest }) {
  const { thing: profile } = useThing(webId)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  return (
    <div className="relative" {...rest}>
      <a href={otherPath(webId)}>
        <div className="inset-0 absolute opacity-0 hover:opacity-100 ">
          {name}
        </div>
        <img className="h-16 w-16 md:h-24 md:w-24 rounded-full mx-auto md:mx-0 md:mr-6"
          alt="profile"
          src={profileImage} />
      </a>
    </div>
  )
}

function Friends() {
  const webId = useWebId()
  const { thing: profile } = useThing(webId)
  const knows = profile && getUrlAll(profile, foaf.knows)
  if (profile) {
    return (
      <div className="flex flex-row h-full">
        {knows && knows.map(url => (
          <Friend webId={url} key={{ url }} />
        ))}
      </div>
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
