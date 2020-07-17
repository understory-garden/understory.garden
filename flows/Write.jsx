import { useState } from "react"

import { Formik, Form } from 'formik';
import {
  getThingOne, createThing, setThing, addStringNoLocale, addUrl, createLitDataset,
  saveLitDatasetInContainer, getUrlAll, getStringNoLocaleOne, getDatetimeOne
} from "@solid/lit-pod";
import { schema, rdf, dct } from "rdf-namespaces"

import { TextField } from "~components/form"
import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import usePostContainer from "~hooks/usePostContainer"
import useThing, { useContainer } from "~hooks/useThing"
import { deleteFile } from '~lib/http'
import { mutate } from "swr"

function Post({ resource, deletePost }) {
  const { thing: post } = useThing(`${resource.url}#post`)
  const title = post && getStringNoLocaleOne(post, schema.headline)
  const body = post && getStringNoLocaleOne(post, schema.articleBody)

  return (
    <div className="inset-0">
      <h3>{title}</h3>
      <p>{body}</p>
      <Button onClick={deletePost}>
        Delete
      </Button>
    </div>
  )
}

function by(term) {
  (a, b) => getDatetimeOne(a, term) > getDatetimeOne(b, term)
}

function PostModules() {
  const postContainer = usePostContainer()
  const { resources, mutate: mutatePosts } = useContainer(postContainer)
  return (
    <>
      {resources && resources.sort(by(dct.modified)).map(resource => (
        <Module key={resource.url}>
          <Post resource={resource} deletePost={async () => {
            await deleteFile(resource.url)
            mutatePosts()
          }} />
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
              <TextField name="title" autoFocus />
              <TextField name="body" />
              <Button type="submit">Create</Button>
            </Form>
          </Formik>

        </Module>
      )}
      <PostModules />
    </Flow>
  )
}
