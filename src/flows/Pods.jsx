import { useState } from "react"

import { Formik, Form } from 'formik';
import {
  createThing, setThing, addStringNoLocale, setStringNoLocale, addUrl, createLitDataset,
  saveLitDatasetInContainer, asUrl, getStringNoLocale, getFetchedFrom,
  getThing, removeAll, getUrlAll
} from "@itme/solid-client";
import { rdf, rdfs, vcard } from "rdf-namespaces"
import { mutate } from "swr"

import { TextField } from "~components/form"
import { Flow, Module, ModuleHeader } from "~components/layout"
import { Button, Avatar } from "~components/elements"
import { CircleWithCrossIcon } from "~components/icons"
import { useWebId } from "~hooks"
import { usePodsContainerUri } from "~hooks/uris"
import useThing, { useContainer, useMeta } from "~hooks/useThing"
import { deleteFile } from '~lib/http'
import { byDctModified } from '~lib/sort'
import podmap from '~vocabs/podmap'

function Pod({ resource, deletePod }) {
  const { thing: pod } = useThing(resource && `${asUrl(resource)}#pod`)
  const name = pod && getStringNoLocale(pod, rdfs.label)
  const members = pod && getUrlAll(pod, vcard.hasMember)
  return (
    <Module key={asUrl(resource)} className="pt-10 motion-safe:animate-slide-module-in">
      <ModuleHeader>
        <div className="flex-grow" >
          {name}
        </div>
        <CircleWithCrossIcon className="w-5 h-5 cursor-pointer"
          onClick={() => deletePod(resource)} />
      </ModuleHeader>
      <div className="absolute inset-0 mt-6 p-3 prose overflow-y-scroll">
        {members && members.map(memberWebId => (
          <Avatar webId={memberWebId} key={memberWebId} />
        ))}
      </div>
    </Module>
  )
}

function ttlFiles(resource) {
  return asUrl(resource).endsWith(".ttl")
}

function PodsModules({ path = "private" }) {
  const myWebId = useWebId()
  const podsContainerUri = usePodsContainerUri(myWebId, path)
  const { resources, mutate: mutatePods } = useContainer(podsContainerUri)
  const { meta: podsContainerMeta, save: saveMeta } = useMeta(podsContainerUri)

  const deletePod = async (podResource) => {
    await deleteFile(asUrl(podResource))
    var meta = podsContainerMeta
    console.log(asUrl(podResource))
    var podMeta = getThing(meta, asUrl(podResource))
    podMeta = removeAll(podMeta, rdfs.label)
    meta = setThing(meta, podMeta)
    await saveMeta(meta)

    mutatePods()
  }
  return (
    <>
      {resources && resources.filter(ttlFiles).sort(byDctModified).reverse().map(resource => (
        <Pod resource={resource} key={asUrl(resource)} deletePod={deletePod} />
      ))}
    </>
  )
}

function CreatePodsModule({ path = "private", onCreated }) {
  const myWebId = useWebId()
  const podsContainerUri = usePodsContainerUri(myWebId, path)
  const { meta: podsContainerMeta, save: saveMeta } = useMeta(podsContainerUri)
  const createPods = async ({ name }) => {
    // add new pod
    var pods = createThing({ name: 'pod' });
    pods = addUrl(pods, rdf.type, podmap.Pod)
    pods = addStringNoLocale(pods, rdfs.label, name);
    var podsDataset = createLitDataset()
    podsDataset = setThing(podsDataset, pods)
    const newPod = await saveLitDatasetInContainer(podsContainerUri, podsDataset, { slugSuggestion: name })

    // add name to meta file
    const newPodUri = getFetchedFrom(newPod)
    var meta = podsContainerMeta || createLitDataset()
    var podMeta = getThing(meta, newPodUri)
    podMeta = setStringNoLocale(podMeta, rdfs.label, name)
    meta = setThing(meta, podMeta)
    await saveMeta(meta)


    mutate(podsContainerUri)
  }

  return (
    <Module>
      <Formik
        initialValues={{ name: "" }}
        onSubmit={async (pods) => {
          await createPods(pods)
          onCreated && onCreated(path, pods)
        }}
      >
        <Form>
          <div className="mb-4 text-align-center">
            <h3>create a pods</h3>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              name
            </label>
            <TextField className="w-full" name="name" autoFocus />
          </div>
          <Button type="submit">Create</Button>
        </Form>
      </Formik>

    </Module>
  )
}

export default function PodsFlow(props) {
  const [creating, setCreating] = useState()
  const [showing, setShowing] = useState('private')
  return (
    <Flow {...props}>
      <Module>
        <Button onClick={() => { setCreating('private') }}>Create Private Pod</Button>
        <Button onClick={() => { setCreating('public') }}>Create Public Pod</Button>
        {showing === 'private' ? (
          <Button onClick={() => { setShowing('public') }}>Show Public Pods</Button>
        ) : (
            <Button onClick={() => { setShowing('private') }}>Show Private Pods</Button>
          )}
      </Module>
      {creating && (<CreatePodsModule path={creating} onCreated={(path) => {
        setCreating(undefined)
        setShowing(path)
      }} />)}
      <PodsModules path={showing} />
    </Flow>
  )
}
