import { useState } from "react"
import { getDatetimeOne } from "@solid/lit-pod";
import { dct } from "rdf-namespaces"
import { foaf, vcard } from 'rdf-namespaces'
import {
  setStringNoLocale, getStringNoLocaleOne, getUrlOne, setUrl
} from '@solid/lit-pod'

import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import ImageUploader from "~components/ImageUploader"
import { useContainer, useProfile } from "~hooks"
import { useImagesContainerUri } from "~hooks/uris"
import { byDctModified } from "~lib/sort"
import { deleteFile } from '~lib/http'

function ImageModule({ resource, deleteImage }) {
  const { profile, save: saveProfile } = useProfile()
  const setProfilePicture = () => {
    saveProfile(setUrl(profile, vcard.hasPhoto, resource.url))
  }
  const modified = resource && getDatetimeOne(resource, dct.modified)
  return (
    <Module>
      <img src={resource.url} className="object-contain h-full" alt="no description" />
      <div className="inset-0 p-6 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100 prose flex flex-col">
        <h6>Modified: {modified && modified.toString()}</h6>
        <Button onClick={deleteImage}>Delete</Button>
        <Button onClick={setProfilePicture}>Make Profile Photo</Button>
        <a href={resource.url}>Link</a>
      </div>
    </Module>
  )
}

function ImageModules({ path = 'private' }) {
  const imagesContainerUri = useImagesContainerUri(path)
  const { resources, mutate: mutatePhotos } = useContainer(imagesContainerUri)
  const deleteImage = async (imageResource) => {
    await deleteFile(imageResource.url)
    mutatePhotos()
  }
  return (
    <>
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <ImageModule key={resource.url} resource={resource} deleteImage={() => deleteImage(resource)} />
      ))}
    </>
  )
}

export default function ImagesFlow() {
  const [creating, setCreating] = useState()
  const [showing, setShowing] = useState('private')

  const imagesContainerUri = useImagesContainerUri('private')
  const { mutate: mutatePhotos } = useContainer(imagesContainerUri)
  return (
    <Flow>
      <Module>
        <Button onClick={() => { setCreating('private') }}>Upload Private Images</Button>
        <Button onClick={() => { setCreating('public') }}>Upload Public Images</Button>
        {showing === 'private' ? (
          <Button onClick={() => { setShowing('public') }}>Show Public Images</Button>
        ) : (
            <Button onClick={() => { setShowing('private') }}>Show Private Images</Button>
          )}

      </Module>
      {creating && (
        <ImageUploader uploadDirectory={imagesContainerUri}
          onUpload={() => { mutatePhotos() }}
          onClose={() => {
            setShowing(creating)
            setCreating(undefined)
          }}
        />
      )}
      <ImageModules path={showing} />
    </Flow>
  )
}
