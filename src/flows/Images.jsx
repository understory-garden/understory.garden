import { useState } from "react"
import { dct } from "rdf-namespaces"
import { vcard } from 'rdf-namespaces'
import {
  setUrl, getDatetimeOne, asUrl, unstable_getPublicAccess
} from '@itme/solid-client'

import { Flow, Module } from "~components/layout"
import { Button, Loader } from "~components/elements"
import ImageUploader from "~components/ImageUploader"
import { useWebId, useContainer, useMyProfile, useFile } from "~hooks"
import { useImagesContainerUri } from "~hooks/uris"
import { byDctModified } from "~lib/sort"
import { deleteFile } from '~lib/http'
import { newClient } from '~lib/files'


function FileSharing({ file }) {
  console.log(asUrl(file))
  const { file: fileWithAcl, ...rest } = useFile(asUrl(file), { acl: true })
  const publicAccess = fileWithAcl && unstable_getPublicAccess(fileWithAcl)
  return (
    <div className="absolute inset-0 z-40 bg-white">
      public sharing for {asUrl(file)}
      <br />
      {JSON.stringify(publicAccess)}
    </div>
  )
}

function ImageModule({ resource, deleteImage, path, showPublic, showPrivate }) {
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const { profile, save: saveProfile } = useMyProfile()
  const setProfilePicture = () => {
    saveProfile(setUrl(profile, vcard.hasPhoto, asUrl(resource)))
  }
  const makePublic = async () => {
    const url = asUrl(resource)
    const f = newClient()
    setSaving(true)
    await f.copyFile(url, url.replace("/private/", "/public/"))
    await f.deleteFile(url)
    setSaving(false)
    showPublic()
  }
  const makePrivate = async () => {
    const url = asUrl(resource)
    const f = newClient()
    setSaving(true)
    await f.copyFile(url, url.replace("/public/", "/private/"))
    await f.deleteFile(url)
    setSaving(false)
    showPrivate()
  }
  const modified = resource && getDatetimeOne(resource, dct.modified)
  return (
    <Module className={`${sharing ? 'w-64 h-64' : ''} motion-safe:animate-slide-module-in`}>
      {sharing && (<FileSharing file={resource} />)}
      <Loader height="100%" width="100%" className={`${saving ? 'block' : 'hidden'} bg-black bg-opacity-25 absolute inset-0 z-40`} />
      <img src={asUrl(resource)} className="object-contain h-full" alt="no description" />
      <div className="inset-0 p-6 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100 prose flex flex-col">
        <h6>Modified: {modified && modified.toString()}</h6>
        <Button onClick={deleteImage}>Delete</Button>
        <Button onClick={setProfilePicture}>Make Profile Photo</Button>
        {path === 'private' && (
          <Button onClick={makePublic}>Make Public</Button>
        )}
        {path === 'public' && (
          <Button onClick={makePrivate}>Make Private</Button>
        )}
        <Button onClick={() => { setSharing(true) }}>Share</Button>
        <a href={asUrl(resource)}>Link</a>
      </div>
    </Module>
  )
}

function outLockfiles(resource) {
  return !asUrl(resource).endsWith(".lock/")
}

function ImageModules({ path = 'private', showPublic, showPrivate }) {
  const myWebId = useWebId()
  const imagesContainerUri = useImagesContainerUri(myWebId, path)
  const { resources, mutate: mutatePhotos } = useContainer(imagesContainerUri)
  const deleteImage = async (imageResource) => {
    await deleteFile(asUrl(imageResource))
    mutatePhotos()
  }
  return (
    <>
      {resources && resources.filter(outLockfiles).sort(byDctModified).reverse().map(resource => (
        <ImageModule key={asUrl(resource)} resource={resource}
          showPublic={showPublic} showPrivate={showPrivate}
          deleteImage={() => deleteImage(resource)} path={path} />
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
      <ImageModules path={showing}
        showPublic={() => { setShowing("public") }}
        showPrivate={() => { setShowing("private") }} />
    </Flow>
  )
}
