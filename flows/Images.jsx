import { useState } from "react"
import { getDatetimeOne } from "@solid/lit-pod";
import { dct } from "rdf-namespaces"

import { Flow, Module } from "~components/layout"
import { Button } from "~components/elements"
import ImageUploader from "~components/ImageUploader"
import useThing, { useContainer } from "~hooks/useThing"
import { useImagesContainerUri } from "~hooks/uris"
import { byDctModified } from "~lib/sort"
import { deleteFile } from '~lib/http'

function Image({ resource, deleteImage }) {
  const modified = resource && getDatetimeOne(resource, dct.modified)
  return (
    <Module>
      <img src={resource.url} className="object-contain h-full" alt="no description" />
      <div className="inset-0 p-6 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100 prose">
        <h6>Modified: {modified && modified.toString()}</h6>
        <Button onClick={deleteImage}>Delete</Button>
      </div>
    </Module>
  )
}

export default function ImagesFlow() {
  const [creating, setCreating] = useState(false)

  const imagesContainerUri = useImagesContainerUri()
  const { resources, mutate: mutatePhotos } = useContainer(imagesContainerUri)
  const deleteImage = async (imageResource) => {
    await deleteFile(imageResource.url)
    mutatePhotos()
  }
  return (
    <Flow>
      <Module>
        <Button onClick={() => { setCreating(true) }}>Upload Photo</Button>
      </Module>
      {creating && (
        <ImageUploader uploadDirectory={imagesContainerUri}
          onUpload={() => { mutatePhotos() }}
          onClose={() => { setCreating(false) }}
        />
      )}
      {resources && resources.sort(byDctModified).reverse().map(resource => (
        <Image key={resource.url} resource={resource} deleteImage={() => deleteImage(resource)} />
      ))}
    </Flow>
  )
}
