import { useState } from "react"

import { Formik, Form } from 'formik';
import {
  createThing, setThing, addStringNoLocale, addUrl, createLitDataset,
  saveLitDatasetInContainer, asUrl, getStringNoLocaleOne
} from "@itme/solid-client";
import { schema, rdf, rdfs } from "rdf-namespaces"
import { mutate } from "swr"
import ReactMarkdown from "react-markdown"

import { TextField } from "~components/form"
import { Flow, Module, ModuleHeader } from "~components/layout"
import { Button } from "~components/elements"
import { CircleWithCrossIcon } from "~components/icons"
import { useWebId } from "~hooks"
import { usePodsContainerUri } from "~hooks/uris"
import useThing, { useContainer } from "~hooks/useThing"
import { deleteFile } from '~lib/http'
import { byDctModified } from '~lib/sort'
import podmap from '~vocabs/podmap'

function Pods({ resource }) {
  const { thing: pods } = useThing(resource && `${asUrl(resource)}#pods`)
  const title = pods && getStringNoLocaleOne(pods, schema.headline)
  const body = pods && getStringNoLocaleOne(pods, schema.articleBody)

  return (
    <div className="absolute inset-0 mt-6 p-3 prose overflow-y-scroll">
      <h2>{title}</h2>
      <ReactMarkdown source={body} />
    </div>
  )
}

function ttlFiles(resource) {
  return asUrl(resource).endsWith(".ttl")
}

function PodsModules({ path = "private" }) {
  const myWebId = useWebId()
  const podsContainerUri = usePodsContainerUri(myWebId, path)
  const { resources, mutate: mutatePods } = useContainer(podsContainerUri)
  const deletePods = async (podsResource) => {
    await deleteFile(asUrl(podsResource))
    mutatePods()
  }
  return (
    <>
      {resources && resources.filter(ttlFiles).sort(byDctModified).reverse().map(resource => (
        <Module key={asUrl(resource)} className="pt-10 motion-safe:animate-slide-module-in">
          <ModuleHeader>
            <div className="flex-grow" />
            <CircleWithCrossIcon className="w-5 h-5 text-white cursor-pointer"
              onClick={() => deletePods(resource)} />
          </ModuleHeader>
          <Pods resource={resource} />
        </Module>
      ))}
    </>
  )
}

function CreatePodsModule({ path = "private", onCreated }) {
  const myWebId = useWebId()
  const podsContainerUri = usePodsContainerUri(myWebId, path)

  const createPods = async ({ name }) => {
    var pods = createThing({ name: 'pods' });
    pods = addUrl(pods, rdf.type, podmap.Pod)
    pods = addStringNoLocale(pods, rdfs.label, name);
    var podsDataset = createLitDataset()
    podsDataset = setThing(podsDataset, pods)
    await saveLitDatasetInContainer(podsContainerUri, podsDataset, { slugSuggestion: name })
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
