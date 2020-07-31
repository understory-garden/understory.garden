import { useState } from "react"
import { dct } from "rdf-namespaces"
import { vcard } from 'rdf-namespaces'
import { setUrl, getDatetimeOne, asUrl } from '@itme/solid-client'

import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import ImageUploader from "~components/ImageUploader"
import { useWebId, useContainer, useMyProfile } from "~hooks"
import { useImagesContainerUri } from "~hooks/uris"
import { byDctModified } from "~lib/sort"
import { deleteFile } from '~lib/http'

function ImageModule({ resource, deleteImage }) {
  const { profile, save: saveProfile } = useMyProfile()
  const setProfilePicture = () => {
    saveProfile(setUrl(profile, vcard.hasPhoto, asUrl(resource)))
  }
  const modified = resource && getDatetimeOne(resource, dct.modified)
  return (
    <Module className="motion-safe:animate-slide-module-in">
      <img src={asUrl(resource)} className="object-contain h-full" alt="no description" />
      <div className="inset-0 p-6 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100 prose flex flex-col">
        <h6>Modified: {modified && modified.toString()}</h6>
        <Button onClick={deleteImage}>Delete</Button>
        <Button onClick={setProfilePicture}>Make Profile Photo</Button>
        <a href={asUrl(resource)}>Link</a>
      </div>
    </Module>
  )
}

function ImageModules({ path = 'private' }) {
  const myWebId = useWebId()
  const imagesContainerUri = useImagesContainerUri(myWebId, path)
  const { resources, mutate: mutatePhotos } = useContainer(imagesContainerUri)
  const deleteImage = async (imageResource) => {
    await deleteFile(asUrl(imageResource))
    mutatePhotos()
  }
  return (
    <>
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <ImageModule key={asUrl(resource)} resource={resource} deleteImage={() => deleteImage(resource)} />
      ))}
    </>
  )
}

export default function ImagesFlow(props) {
  const [creating, setCreating] = useState()
  const [showing, setShowing] = useState('private')
  const myWebId = useWebId()
  const imagesContainerUri = useImagesContainerUri(myWebId, creating)
  const { mutate: mutatePhotos } = useContainer(imagesContainerUri)
  return (
    <Flow {...props}>
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
