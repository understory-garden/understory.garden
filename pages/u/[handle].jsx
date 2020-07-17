import { useState } from 'react'
import { foaf, vcard } from 'rdf-namespaces'
import {
  getUrlAll, removeUrl, addUrl,
  getStringNoLocaleOne, getUrlOne
} from '@solid/lit-pod'
import { useRouter } from 'next/router'

import useThing from "../../hooks/useThing"
import { Space, Flow, Module } from "../../components/layout"
import { Button } from "../../components/elements"
import useWebId from "../../hooks/useWebId"

function AddKnows({ webId }) {
  const myWebId = useWebId()
  const { thing: myProfile, save: saveMyProfile } = useThing(myWebId)
  const alreadyKnows = myProfile && getUrlAll(myProfile, foaf.knows).includes(webId)
  const [saving, setSaving] = useState(false)
  const toggleKnows = alreadyKnows ? removeUrl : addUrl
  return (myProfile == undefined) ? ("Loading...") : (
    <Button onClick={
      async () => {
        setSaving(true)
        await saveMyProfile(toggleKnows(myProfile, foaf.knows, webId))
        setSaving(false)
      }}
      disabled={saving}
    >
      {alreadyKnows ? "remove" : "add"} knows
    </Button>
  )
}

function handleToWebId(handle) {
  try {
    new URL(handle);
    // if this doesn't throw, it's a valid URL
    return handle
  } catch (_) {
    return `https://${handle}/profile/card#me`
  }
}

export default function OtherProfile() {
  const router = useRouter()
  const { handle } = router.query
  const webId = handleToWebId(handle)
  const { thing: profile } = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  if (profile) {
    return (
      <Space>
        <Flow className="h-full w-full">
          <Module className="p-6 flex-grow">
            <div className="">
              {name}
            </div>
            <AddKnows webId={webId} />

            {profileImage && <img className="h-full m-auto" src={profileImage} alt={name} />}
          </Module>
        </Flow>
      </Space>
    )
  } else {
    return <div>loading...!!</div>
  }

}
