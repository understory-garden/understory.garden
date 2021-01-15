import React, { useEffect, useRef, useState } from 'react';

import { Transforms } from 'slate';
import { useEditor } from 'slate-react';

import { fetch } from 'solid-auth-fetcher'
import { v1 as uuid } from 'uuid';
import Cropper from 'react-cropper';
import newBlobReducer from 'image-blob-reduce'

import { insertionPoint, insertImage } from '../utils/editor';
import { Loader } from './elements';

const ImageEditingModule = ({ src, onSave, onClose, ...props }) => {
  const [saving, setSaving] = useState()
  const cropperRef = useRef()
  const save = async () => {
    setSaving(true)
    await onSave(cropperRef.current.cropper.getCroppedCanvas())
    setSaving(false)
  }
  return (
    <div onClose={onClose} {...props}>
      <Cropper
        ref={cropperRef}
        src={src}
        crossOrigin="use-credentials"
        className="h-48"
      />
      <div className="flex flex-row">
        <button className="btn mr-3" onClick={() => {
          cropperRef.current.cropper.rotate(90)
        }}>
          rotate
        </button>
        {saving ? (
          <Loader />
        ) : (
            <>
              <button className="btn mr-3" onClick={save}>
                save
              </button>
              <button className="btn" onClick={onClose}>
                cancel
            </button>
            </>
          )}
      </div>
    </div >
  )
}

const typesToExts = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp"
}

const nameForFile = file => `${uuid()}.${extForFile(file)}`

const extForFile = file => {
  const extFromType = typesToExts[file.type]
  if (extFromType) {
    return extFromType
  } else {
    return file.name.split(".").slice(-1)[0]
  }
}

const blobReducer = newBlobReducer()

const uploadFromCanvas = (canvas, uri, type, { fetch: passedFetch } = {} ) => new Promise((resolve, reject) => {
  const myFetch = passedFetch || fetch
  canvas.toBlob(async (blob) => {
    const scaledBlob = await blobReducer.toBlob(blob, {max: 600})
    const response = await myFetch(uri, {
      method: 'PUT',
      force: true,
      headers: {
        'content-type': type,
        credentials: 'include'
      },
      body: scaledBlob
    });
    if (response.ok) {
      resolve(response)
    } else {
      reject(response)
      console.log("image upload failed: ", response)
    }
  }, type, 1)

})

const uploadFromFile = (file, uri, { fetch: passedFetch } = {}) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  const myFetch = passedFetch || fetch
  reader.onload = async f => {
    const response = await myFetch(uri, {
      method: 'PUT',
      force: true,
      headers: {
        'content-type': file.type,
        credentials: 'include'
      },
      body: f.target.result
    });
    if (response.ok){
      resolve(response)
    } else {
      reject(response)
    }
  }
  reader.readAsArrayBuffer(file);
})

export function ImageEditor({ element, onClose, onSave, ...props }) {

  const { url, originalUrl, mime } = element
  return (
    <ImageEditingModule src={originalUrl || url}
      onClose={onClose}
      onSave={async (canvas) => {
        await uploadFromCanvas(canvas, url, mime)
        onSave(url)
      }} {...props} />
  )
}

const uriForOriginal = (editedUri) => {
  const parts = editedUri.split(".")
  return [...parts.slice(0, -1), "original", ...parts.slice(-1)].join(".")
}


export default function ImageUploader({ element, onClose, onUpload, uploadDirectory, ...props }){
  const inputRef = useRef()
  const [file, setFile] = useState()
  const editor = useEditor()
  const [originalSrc, setOriginalSrc] = useState()
  const [previewSrc, setPreviewSrc] = useState()
  const [croppedCanvas, setCroppedCanvas] = useState()
  const [editing, setEditing] = useState(false)
  const [altText, setAltText] = useState("")

  const insert = async () => {
    const editedUri = `${uploadDirectory}${nameForFile(file)}`
    const originalUri = uriForOriginal(editedUri)
    try {
      uploadFromFile(file, originalUri)
      const response = await uploadFromCanvas(croppedCanvas, editedUri, file.type)
      onUpload && onUpload(response, file.type)
      const insertAt = insertionPoint(editor, element)
      insertImage(editor, {url: editedUri, originalUrl: originalUri, alt: altText, mime: file.type}, insertAt);
      Transforms.select(editor, insertAt)
      onClose && onClose()
    } catch (e){
      alert("problem uploading your image - it's probably too big. please scale it down and try again.")
    }
  }

  useEffect(() => {
    let newSrc;
    if (file) {
      newSrc = URL.createObjectURL(file)
      setOriginalSrc(newSrc)
      setPreviewSrc(newSrc)
      setEditing(true)
    }
    return () => {
      if (newSrc) {
        URL.revokeObjectURL(newSrc)
      }
    }
  }, [file])

  const onFileChanged = event => {
    if (event.target.files) {
      const file = event.target.files[0]
      setFile(file)
    }
  }

  return (
    <>
      {
        editing ? (
          <ImageEditingModule open={editing} src={originalSrc}
            onClose={onClose}
            onSave={async (canvas) => {
              setPreviewSrc(canvas.toDataURL(file.type))
              setCroppedCanvas(canvas)
              setEditing(false)
            }} />

        ) : (
            <div {...props}>
              {previewSrc && (
                <img src={previewSrc} className="h-32 object-contain" alt="your new profile" />
              )}
              <div className="flex flex-row">
                <button className="btn mr-3" onClick={() => inputRef.current.click()}>
                  pick a file
                </button>
                {croppedCanvas &&
                  <>
                    <button className="btn mr-3" onClick={() => setEditing(true)}>
                      edit
                   </button>
                    <button className="btn mr-3" onClick={insert}>
                      insert
                   </button>
                  </>
                }
                <button onClick={() => onClose && onClose()}>
                  cancel
                </button>
              </div>
              <input
                ref={inputRef}
                accept="image/*"
                style={{ display: 'none' }}
                type="file"
                onChange={onFileChanged}
              />
            </div>
          )
      }
    </>
  )
}
