import { useState } from "react"

import { Formik, Form } from 'formik';
import {
  createThing, setThing, addStringNoLocale, addUrl, createLitDataset,
  saveLitDatasetInContainer, getUrlAll, getStringNoLocaleOne
} from "@solid/lit-pod";
import { schema, rdf, ldp } from "rdf-namespaces"

import { TextField } from "~components/form"
import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import usePostContainer from "~hooks/usePostContainer"
import useThing from "~hooks/useThing"
import { deleteFile } from '~lib/http'
import { mutate } from "swr"

function Post({ url, deletePost }) {
  const { thing: post } = useThing(url)
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

function PostModules() {
  const postContainer = usePostContainer()
  const { thing: posts, mutate: mutatePosts } = useThing(postContainer)
  const postUrls = posts && getUrlAll(posts, ldp.contains)
  return (
    <>
      {postUrls && postUrls.reverse().map(postUrl => (
        <Module key={postUrl}>
          <Post url={`${postUrl}#post`} deletePost={async () => {
            await deleteFile(postUrl)
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
