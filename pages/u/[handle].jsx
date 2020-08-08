import { useState } from 'react'
import { foaf, vcard, schema } from 'rdf-namespaces'
import {
  getUrlAll, removeUrl, addUrl, fetchLitDataset, saveLitDatasetAt, setThing,
  getStringNoLocale, getUrl, asUrl, getThing
} from '@itme/solid-client'
import ReactMarkdown from "react-markdown"
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Formik, Form } from 'formik';
import { mutate } from 'swr'

import { Space, Flow, Module } from "~components/layout"
import Page from "~components/Page"
import { Button, Loader } from "~components/elements"
import { PodPicker } from "~components/form"
import useWebId from "~hooks/useWebId"
import { useImagesContainerUri, usePostsContainerUri, useItmeStylesheetUri } from "~hooks/uris"
import useThing, { useContainer } from "~hooks/useThing"
import itme from "~vocabs/itme"

import { byDctModified } from "~lib/sort"


function AddKnows({ webId }) {
  const myWebId = useWebId()
  const { thing: myProfile, save: saveMyProfile } = useThing(myWebId)
  const alreadyKnows = myProfile && getUrlAll(myProfile, foaf.knows).includes(webId)
  const [saving, setSaving] = useState(false)
  const toggleKnows = alreadyKnows ? removeUrl : addUrl

  const { thing: profile } = useThing(webId)
  const name = profile && getStringNoLocale(profile, foaf.name)

  return (myProfile == undefined) ? (<Loader />) : (
    <Formik
      initialValues={{ pod: undefined }}
      onSubmit={async ({ pod: podUri }) => {
        if (podUri) {
          var podDataset = await fetchLitDataset(podUri)
          const podThingUri = `${podUri}#pod`
          var pod = getThing(podDataset, podThingUri)
          pod = addUrl(pod, vcard.hasMember, webId)
          podDataset = setThing(podDataset, pod)
          await saveLitDatasetAt(podUri, podDataset)
          mutate(podUri)
          mutate(podThingUri)

        }
      }}
    >
      <Form>
        <PodPicker name="pod" />
        <Button type="submit">Add</Button>
      </Form>
    </Formik>
    /*
    <Button onClick={
      async () => {
        setSaving(true)
        await saveMyProfile(toggleKnows(myProfile, foaf.knows, webId))
        setSaving(false)
      }}
      disabled={saving}
    >
      {alreadyKnows ? "I don't know" : "I know"} {name}
    </Button>*/
  )
}

function handleToWebId(handle) {
  if (handle) {
    try {
      new URL(handle);
      // if this doesn't throw, it's a valid URL
      return handle
    } catch (_) {
      return `https://${handle}/profile/card#me`
    }
  }
}

function ImageModule({ resource }) {
  return (
    <Module className="motion-safe:animate-slide-module-in">
      <img src={asUrl(resource)} className="object-contain h-full" alt="no description" />
    </Module>
  )
}

function PostModule({ resource }) {
  const { thing: post } = useThing(resource && `${asUrl(resource)}#post`)
  const title = post && getStringNoLocale(post, schema.headline)
  const body = post && getStringNoLocale(post, schema.articleBody)

  return (
    <Module className="motion-safe:animate-slide-module-in ">
      <div className="absolute inset-0 mt-6 p-3 prose overflow-y-scroll">
        <h2>{title}</h2>
        <ReactMarkdown source={body} />
      </div>
    </Module>
  )
}

function ImagesFlow({ webId, ...props }) {
  const imagesContainerUri = useImagesContainerUri(webId, "public")
  const { resources } = useContainer(imagesContainerUri)
  return (
    <Flow {...props}>
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <ImageModule key={asUrl(resource)} resource={resource} />
      ))}
    </Flow>
  )
}

function PostsFlow({ webId, ...props }) {
  const postContainerUri = usePostsContainerUri(webId, "public")
  const { resources } = useContainer(postContainerUri)
  return (
    <Flow {...props}>
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <PostModule key={asUrl(resource)} resource={resource} />
      ))}
    </Flow>
  )
}

export default function UserProfile() {
  const myWebId = useWebId()
  const router = useRouter()
  const { handle } = router.query
  const webId = handle && handleToWebId(handle)
  const { thing: profile } = useThing(webId)
  const name = profile && getStringNoLocale(profile, foaf.name)
  const profileImage = profile && getUrl(profile, vcard.hasPhoto)
  const paymentPointer = profile && getStringNoLocale(profile, itme.paymentPointer)
  const stylesheetUri = useItmeStylesheetUri(webId)
  if (profile) {
    return (
      <>
        <Head>
          {paymentPointer && (<meta name="monetization" content={paymentPointer} />)}
        </Head>
        <Page>
          {stylesheetUri && (<link rel="stylesheet" type="text/css" href={stylesheetUri} />)}
          <Space>
            <Flow>
              <Module className="p-6 flex-grow">
                <div className="flex flex-row">
                  {profileImage && <img className="w-64 mr-6 " src={profileImage} alt={name} />}
                  <div>
                    <h2>{name}</h2>
                    {(myWebId !== webId) && <AddKnows webId={webId} />}
                  </div>
                </div>
              </Module>
            </Flow>
            <ImagesFlow webId={webId} className="motion-safe:animate-slide-flow-in" />
            <PostsFlow webId={webId} className="motion-safe:animate-slide-flow-in" />
          </Space>
        </Page>
      </>
    )
  } else {
    return <div><Loader /></div>
  }

}
