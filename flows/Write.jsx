import { useState, useEffect } from "react"

import { Formik, Form } from 'formik';
import {
  createThing, setThing, addStringNoLocale, addUrl, createLitDataset,
  saveLitDatasetInContainer, getUrlAll
} from "@solid/lit-pod";
import { schema, rdf, space, ldp } from "rdf-namespaces"
import useThing from "~hooks/useThing"

import { TextField } from "~components/form"
import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import usePostContainer from "~hooks/usePostContainer"

function PostModules() {
  const postContainer = usePostContainer()
  const { thing: posts } = useThing(postContainer)
  const postUrls = posts && getUrlAll(posts, ldp.contains)
  console.log(postUrls)
  return (
    <>
      {postUrls && postUrls.map(postUrl => (
        <Module key={postUrl}>
          {postUrl}
        </Module>
      ))}
    </>
  )
}

export default function WriteFlow() {
  const postContainer = usePostContainer()
  const [creating, setCreating] = useState(false)
  const createPost = ({ body, title }) => {
    var post = createThing();
    post = addUrl(post, rdf.type, schema.BlogPosting)
    post = addStringNoLocale(post, schema.headline, title);
    post = addStringNoLocale(post, schema.articleBody, body);
    var postDataset = createLitDataset()
    postDataset = setThing(postDataset, post)
    saveLitDatasetInContainer(postContainer, postDataset, { slugSuggestion: title })

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
