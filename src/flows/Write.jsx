import { useState } from "react"

import { Formik, Form } from 'formik';
import {
  createThing, setThing, addStringNoLocale, addUrl, createLitDataset,
  saveLitDatasetInContainer, asUrl, getStringNoLocaleOne
} from "@itme/solid-client";
import { schema, rdf, dct } from "rdf-namespaces"
import { mutate } from "swr"
import ReactMarkdown from "react-markdown"

import { TextField, TextAreaField } from "~components/form"
import { Flow, Module, ModuleHeader } from "~components/layout"
import { Button } from "~components/elements"
import { CircleWithCrossIcon } from "~components/icons"
import { useWebId } from "~hooks"
import { usePostsContainerUri } from "~hooks/uris"
import useThing, { useContainer } from "~hooks/useThing"
import { deleteFile } from '~lib/http'
import { byDctModified } from '~lib/sort'

function Post({ resource }) {
  const { thing: post } = useThing(resource && `${asUrl(resource)}#post`)
  const title = post && getStringNoLocaleOne(post, schema.headline)
  const body = post && getStringNoLocaleOne(post, schema.articleBody)

  return (
    <div className="absolute inset-0 mt-6 p-3 prose overflow-y-scroll">
      <h2>{title}</h2>
      <ReactMarkdown source={body} />
    </div>
  )
}

function PostModules({ path = "private" }) {
  const myWebId = useWebId()
  const postContainerUri = usePostsContainerUri(myWebId, path)
  const { resources, mutate: mutatePosts } = useContainer(postContainerUri)
  const deletePost = async (postResource) => {
    await deleteFile(asUrl(postResource))
    mutatePosts()
  }
  return (
    <>
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <Module key={asUrl(resource)} className="pt-10">
          <ModuleHeader>
            <div className="flex-grow" />
            <CircleWithCrossIcon className="w-5 h-5 text-white cursor-pointer"
              onClick={() => deletePost(resource)} />
          </ModuleHeader>
          <Post resource={resource} />
        </Module>
      ))}
    </>
  )
}

function CreatePostModule({ path = "private", onCreated }) {
  const myWebId = useWebId()
  const postContainerUri = usePostsContainerUri(myWebId, path)

  const createPost = async ({ body, title }) => {
    var post = createThing({ name: 'post' });
    post = addUrl(post, rdf.type, schema.BlogPosting)
    post = addStringNoLocale(post, schema.headline, title);
    post = addStringNoLocale(post, schema.articleBody, body);
    var postDataset = createLitDataset()
    postDataset = setThing(postDataset, post)
    await saveLitDatasetInContainer(postContainerUri, postDataset, { slugSuggestion: title })
    mutate(postContainerUri)
  }

  return (
    <Module>
      <Formik
        initialValues={{ title: "", body: "" }}
        onSubmit={async (post) => {
          await createPost(post)
          onCreated && onCreated(path, post)
        }}
      >
        <Form>
          <div className="mb-4 text-align-center">
            <h3>create a post</h3>
            <label className="block text-gray-700 text-sm font-bold mb-2" for="title">
              title
            </label>
            <TextField className="w-full" name="title" autoFocus />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" for="body">
              body
            </label>
            <TextAreaField name="body" className="w-full" />
          </div>

          <Button type="submit">Create</Button>
        </Form>
      </Formik>

    </Module>
  )
}

export default function WriteFlow() {
  const [creating, setCreating] = useState()
  const [showing, setShowing] = useState('private')
  return (
    <Flow>
      <Module>
        <Button onClick={() => { setCreating('private') }}>Create Private Post</Button>
        <Button onClick={() => { setCreating('public') }}>Create Public Post</Button>
        {showing === 'private' ? (
          <Button onClick={() => { setShowing('public') }}>Show Public Posts</Button>
        ) : (
            <Button onClick={() => { setShowing('private') }}>Show Private Posts</Button>
          )}
      </Module>
      {creating && (<CreatePostModule path={creating} onCreated={(path) => {
        setCreating(undefined)
        setShowing(path)
      }} />)}
      <PostModules path={showing} />
    </Flow>
  )
}
