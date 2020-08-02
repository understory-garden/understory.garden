import { useState } from 'react'

import { foaf, vcard } from 'rdf-namespaces'
import {
  setStringNoLocale, getStringNoLocaleOne, getUrlOne, setUrl
} from '@itme/solid-client'

import useWebId from "~hooks/useWebId"
import { useMyProfile } from "~hooks"
import { useImagesContainerUri } from "~hooks/uris"
import { Module } from "~components/layout"
import { Link, Loader } from "~components/elements"
import { Edit } from "~components/icons"
import { EditableText } from "~components/editable"
import ImageUploader from "~components/ImageUploader"
import { otherPath } from "~lib/urls"
import itme from "~/lib/ontology"

function ProfileImageUploader({ onSaved, onClose }) {
  const { profile, save: saveProfile } = useMyProfile()
  const imageContainerUri = useImagesContainerUri()
  const onUpload = async (response) => {
    const fileUrl = new URL(response.headers.get("location"), response.url).toString()
    saveProfile(setUrl(profile, vcard.hasPhoto, fileUrl))
    onSaved && onSaved()
  }
  return (
    <ImageUploader uploadDirectory={imageContainerUri}
      onUpload={onUpload} onClose={onClose} />
  )
}

export default function Profile() {
  const [editingImage, setEditingImage] = useState(false)
  const webId = useWebId()
  const { profile, save: saveProfile } = useMyProfile()
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const saveName = async newName => {
    saveProfile(setStringNoLocale(profile, foaf.name, newName))
  }
  const paymentPointer = profile && getStringNoLocaleOne(profile, itme.paymentPointer)
  const savePaymentPointer = async newPaymentPointer => {
    saveProfile(setStringNoLocale(profile, itme.paymentPointer, newPaymentPointer))
  }
  return (
    <>
      <Module>
        {profile ? (
          <>
            <div className="inset-0 p-6 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100">
              <Edit className="absolute right-0 top-0 w-6 h-6 text-gray-900 cursor-pointer"
                onClick={() => setEditingImage(true)}
              />
              <h3 className="text-2xl">
                hello, <EditableText save={saveName} value={name} placeholder="name">{name}</EditableText>
              </h3>
              <Link href="/u/[handle]" as={otherPath(webId)}><h4>Public Profile</h4></Link>
              <h3>payment pointer: <EditableText save={savePaymentPointer} value={paymentPointer} placeholder="payment pointer">{paymentPointer}</EditableText></h3>
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
