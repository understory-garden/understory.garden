import { useState } from 'react'

import { foaf, vcard } from 'rdf-namespaces'
import {
  setStringNoLocale, getStringNoLocaleOne, getUrlOne, setUrl
} from '@solid/lit-pod'

import useWebId from "~hooks/useWebId"
import useStorageUri from "~hooks/useStorageUri"
import useEnsured from "~hooks/useEnsured"
import useProfile from "~hooks/useProfile"
import { Module } from "~components/layout"
import { Loader } from "~components/elements"
import { Edit } from "~components/icons"

import { EditableText } from "~components/editable"
import ImageUploader from "~components/ImageUploader"
import { otherPath } from "~lib/urls"

function ProfileImageUploader({ onSaved, onClose }) {
  const { profile, save: saveProfile } = useProfile()
  const storageUri = useStorageUri()
  const imageContainerUri = useEnsured(storageUri && `${storageUri}public/images/`)
  const onUpload = async (response, fileType) => {
    const fileUrl = new URL(response.headers.get("location"), response.url).toString()
    saveProfile(setUrl(profile, vcard.hasPhoto, fileUrl))
    onSaved && onSaved()
  }
  return (
    <ImageUploader open={true} uploadDirectory={imageContainerUri}
      onUpload={onUpload} onClose={onClose} />
  )
}

export default function Profile() {
  const [editingImage, setEditingImage] = useState(false)
  const webId = useWebId()
  const { profile, save: saveProfile } = useProfile()
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const saveName = async newName => {
    saveProfile(setStringNoLocale(profile, foaf.name, newName))
  }
  return (
    <>
      <Module>
        {profile ? (
          <>
            <div className="inset-0 p-6 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100 prose">
              <Edit tooltip="edit profile image"
                className="absolute right-0 top-0 w-6 h-6 text-gray-900 cursor-pointer"
                onClick={() => setEditingImage(true)}
              />
              <h3>
                hello, <EditableText save={saveName} value={name} placeholder="name">{name}</EditableText>
              </h3>
              <a href={otherPath(webId)}><h4>Public Profile</h4></a>
            </div>
            {profileImage && <img className="h-full m-auto" src={profileImage} alt={name} />}
          </>
        ) : (
            <Loader />
          )
        }
      </Module>
      {editingImage && <ProfileImageUploader open={true}
        onSaved={() => { setEditingImage(false) }}
        onClose={() => { setEditingImage(false) }}
      />}
    </>
  )
}
