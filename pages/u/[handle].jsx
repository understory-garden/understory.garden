import { useState } from 'react'
import { foaf, vcard } from 'rdf-namespaces'
import {
  getUrlAll, removeUrl, addUrl,
  getStringNoLocaleOne, getUrlOne
} from '@solid/lit-pod'
import ReactMarkdown from "react-markdown"
import { useRouter } from 'next/router'
import { schema } from "rdf-namespaces"

import { Space, Flow, Module } from "~components/layout"
import { Button, Loader } from "~components/elements"
import useWebId from "~hooks/useWebId"
import { useImagesContainerUri, usePostsContainerUri } from "~hooks/uris"
import useThing, { useContainer } from "~hooks/useThing"

import { byDctModified } from "~lib/sort"

function AddKnows({ webId }) {
  const myWebId = useWebId()
  const { thing: myProfile, save: saveMyProfile } = useThing(myWebId)
  const alreadyKnows = myProfile && getUrlAll(myProfile, foaf.knows).includes(webId)
  const [saving, setSaving] = useState(false)
  const toggleKnows = alreadyKnows ? removeUrl : addUrl
  return (myProfile == undefined) ? (<Loader />) : (
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

function ImageModule({ resource }) {
  return (
    <Module>
      <img src={resource.url} className="object-contain h-full" alt="no description" />
    </Module>
  )
}

function PostModule({ resource }) {
  const { thing: post } = useThing(`${resource.url}#post`)
  const title = post && getStringNoLocaleOne(post, schema.headline)
  const body = post && getStringNoLocaleOne(post, schema.articleBody)

  return (
    <Module>
      <div className="absolute inset-0 mt-6 p-3 prose overflow-y-scroll">
        <h2>{title}</h2>
        <ReactMarkdown source={body} />
      </div>
    </Module>
  )
}

function ImagesFlow() {
  const imagesContainerUri = useImagesContainerUri("public")
  const { resources } = useContainer(imagesContainerUri)
  return (
    <Flow>
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <ImageModule key={resource.url} resource={resource} />
      ))}
    </Flow>
  )
}

function PostsFlow() {
  const postContainerUri = usePostsContainerUri("public")
  const { resources } = useContainer(postContainerUri)
  return (
    <Flow>
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <PostModule key={resource.url} resource={resource} />
      ))}
    </Flow>
  )
}

export default function UserProfile() {
  const router = useRouter()
  const { handle } = router.query
  const webId = handleToWebId(handle)
  const { thing: profile } = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  if (profile) {
    return (
      <Space>
        <Flow>
          <Module className="p-6 flex-grow">
            <div className="flex flex-row">
              {profileImage && <img className="w-64 m-4" src={profileImage} alt={name} />}
              <div>
                <h2>{name}</h2>
                <AddKnows webId={webId} />
              </div>
            </div>
          </Module>
        </Flow>
        <ImagesFlow />
        <PostsFlow />
      </Space>
    )
  } else {
    return <div><Loader /></div>
  }

}
