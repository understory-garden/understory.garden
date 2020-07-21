import { useState } from "react"

import { Formik, Form } from 'formik';
import {
  getThingOne, createThing, setThing, addStringNoLocale, addUrl, createLitDataset,
  saveLitDatasetInContainer, getUrlAll, getStringNoLocaleOne, getDatetimeOne
} from "@solid/lit-pod";
import { schema, rdf, dct } from "rdf-namespaces"

import { TextField, TextAreaField } from "~components/form"
import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import { CircleWithCross } from "~components/icons"
import usePostContainer from "~hooks/usePostContainer"
import useThing, { useContainer } from "~hooks/useThing"
import { deleteFile } from '~lib/http'
import { mutate } from "swr"
import ReactMarkdown from "react-markdown"

function Post({ resource }) {
  const { thing: post } = useThing(`${resource.url}#post`)
  const title = post && getStringNoLocaleOne(post, schema.headline)
  const body = post && getStringNoLocaleOne(post, schema.articleBody)

  return (
    <div className="absolute inset-0 mt-6 p-3 prose overflow-y-scroll">
      <h2>{title}</h2>
      <ReactMarkdown source={body} />
    </div>
  )
}

function byDatetime(term) {
  (a, b) => getDatetimeOne(a, term) > getDatetimeOne(b, term)
}

function PostModules() {
  const postContainer = usePostContainer()
  const { resources, mutate: mutatePosts } = useContainer(postContainer)
  const deletePost = async (postResource) => {
    await deleteFile(postResource.url)
    mutatePosts()
  }
  return (
    <>
      {resources && resources.sort(byDatetime(dct.modified)).map(resource => (
        <Module key={resource.url} className="pt-10">
          <div className="absolute top-0 left-0 right-0 pb-2 bg-white bg-opacity-25 flex flex-row">
            <div className="flex-grow" />
            <CircleWithCross className="w-5 h-5 text-white cursor-pointer"
              onClick={() => deletePost(resource)} />
          </div>
          <Post resource={resource} />
        </Module>
      ))}
    </>
  )
}

export default function WriteFlow() {
  const postContainer = usePostContainer()
  const [creating, setCreating] = useState(false)
  const createPost = async ({ body, title }) => {
    var post = createThing({ name: 'post' });
    post = addUrl(post, rdf.type, schema.BlogPosting)
    post = addStringNoLocale(post, schema.headline, title);
    post = addStringNoLocale(post, schema.articleBody, body);
    var postDataset = createLitDataset()
    postDataset = setThing(postDataset, post)
    await saveLitDatasetInContainer(postContainer, postDataset, { slugSuggestion: title })
    mutate(postContainer)
  }
  return (
    <Flow>
      <Module>
        <Button onClick={() => { setCreating(true) }}>Create Post</Button>
      </Module>
      {creating && (
        <Module>
          <Formik
            initialValues={{ title: "", body: "" }}
            onSubmit={async (post) => {
              await createPost(post)
              setCreating(false)
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
      )}
      <PostModules />
    </Flow>
  )
}
